import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// Simple in-memory rate limiting for admin operations
const adminRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkAdminRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = adminRateLimit.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    adminRateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 100);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Rate limiting
    if (!checkAdminRateLimit(session.user.id, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const { id } = params;
    const body = await request.json();
    const { name, email } = body;
    
    // Validate required fields
    if (!name && !email) {
      return NextResponse.json({ error: 'At least one field (name or email) is required' }, { status: 400 });
    }
    
    // Find the admin to update
    const adminToUpdate = await User.findById(id);
    
    if (!adminToUpdate) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    // Ensure the user is an admin
    if (adminToUpdate.role !== 'admin') {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 400 });
    }
    
    // Update fields if provided
    if (name) {
      const safeName = sanitizeInput(name);
      if (safeName.length < 2 || safeName.length > 50) {
        return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
      }
      adminToUpdate.name = safeName;
    }
    
    if (email) {
      const safeEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safeEmail)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: safeEmail, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({ error: 'Email is already taken by another user' }, { status: 409 });
      }
      
      adminToUpdate.email = safeEmail;
    }
    
    await adminToUpdate.save();
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        _id: adminToUpdate._id,
        name: adminToUpdate.name,
        email: adminToUpdate.email,
        createdAt: adminToUpdate.createdAt,
      }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
} 
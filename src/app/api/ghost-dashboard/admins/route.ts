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

export async function GET(request: NextRequest) {
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
    
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json({
      admins: admins.map(admin => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Rate limiting
    if (!checkAdminRateLimit(session.user.id, 5, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    
    // Sanitize inputs
    const safeName = sanitizeInput(name);
    const safeEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    
    // Validate name length
    if (safeName.length < 2 || safeName.length > 50) {
      return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    // Create new admin user
    const adminUser = new User({
      name: safeName,
      email: safeEmail,
      password,
      role: 'admin',
      articlesGenerated: 0,
    });
    
    await adminUser.save();
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        createdAt: adminUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');
    
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    // Prevent admin from deleting themselves
    if (adminId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    const deletedAdmin = await User.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// Simple in-memory rate limiting for admin registration
const adminRegistrationRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkAdminRegistrationRateLimit(ip: string, limit: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const ipLimit = adminRegistrationRateLimit.get(ip);
  
  if (!ipLimit || now > ipLimit.resetTime) {
    adminRegistrationRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (ipLimit.count >= limit) {
    return false;
  }
  
  ipLimit.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Rate limiting: 3 admin registrations per hour per IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!checkAdminRegistrationRateLimit(clientIp, 3, 3600000)) {
      return NextResponse.json(
        { error: 'Too many admin registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin account already exists. Only one admin is allowed.' },
        { status: 409 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const safeName = sanitizeInput(name);
    const safeEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate name length
    if (safeName.length < 2 || safeName.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
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
      message: 'Admin account created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        articlesGenerated: adminUser.articlesGenerated,
      },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
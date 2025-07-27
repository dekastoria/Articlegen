import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// Simple in-memory rate limiting for registration
const registrationRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRegistrationRateLimit(ip: string, limit: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const ipLimit = registrationRateLimit.get(ip);
  
  if (!ipLimit || now > ipLimit.resetTime) {
    registrationRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (ipLimit.count >= limit) {
    return false;
  }
  
  ipLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Rate limiting: 3 registrations per hour per IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!checkRegistrationRateLimit(clientIp, 3, 3600000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      articlesGenerated: 0,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        articlesGenerated: user.articlesGenerated,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
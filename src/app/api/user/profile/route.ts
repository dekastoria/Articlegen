import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

// Simple in-memory rate limiting (per user)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(userId: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (userLimit.count >= limit) {
    return false;
  }
  userLimit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await User.findById(session.user.id).select('-password');
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, user });
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Rate limit
  if (!checkRateLimit(session.user.id, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again in 1 minute.' }, { status: 429 });
  }
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const body = await request.json();
  const { name, email, currentPassword, newPassword } = body;

  // Update name
  if (name) {
    if (typeof name !== 'string' || name.length < 2 || name.length > 50) {
      return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
    }
    user.name = name;
  }
  // Update email
  if (email && email !== user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    user.email = email.toLowerCase();
  }
  // Update password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password required' }, { status: 400 });
    }
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }
    user.password = newPassword;
  }
  await user.save();
  return NextResponse.json({ success: true });
} 
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if any admin user exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    return NextResponse.json({
      exists: adminCount > 0,
      count: adminCount
    });
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return NextResponse.json(
      { error: 'Failed to check admin existence' },
      { status: 500 }
    );
  }
} 
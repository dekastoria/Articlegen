import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const isGhostDashboard = req.nextUrl.pathname.startsWith('/ghost-dashboard');
  const isGhostApi = req.nextUrl.pathname.startsWith('/api/ghost-dashboard');
  const isGhostRegister = req.nextUrl.pathname === '/ghost-register';
  
  // Check for admin routes
  if (isGhostDashboard || isGhostApi) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'admin') {
      if (isGhostDashboard) {
        return NextResponse.redirect(new URL('/ghost-login', req.url));
      } else {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
  
  // Check for ghost-register (only allow if no admin exists)
  if (isGhostRegister) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If admin already exists, redirect to home
    if (token && token.role === 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: ['/ghost-dashboard/:path*', '/api/ghost-dashboard/:path*', '/ghost-register'] 
}; 
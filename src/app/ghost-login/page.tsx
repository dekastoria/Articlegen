'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function GhostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If already logged in as admin, redirect to admin dashboard
  if (session?.user?.role === 'admin') {
    router.push('/ghost-dashboard');
    return null;
  }

  // If logged in as regular user, redirect to home
  if (session?.user?.role === 'user') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        // Check if the logged in user is an admin
        const response = await fetch('/api/auth/me');
        const userData = await response.json();
        
        if (userData.user?.role === 'admin') {
          toast.success('Admin login successful!');
          router.push('/ghost-dashboard');
        } else {
          toast.error('Access denied. Admin privileges required.');
          // Sign out the user since they're not an admin
          await signIn('credentials', { redirect: false });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600 mr-2" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Access the administrative dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter admin email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in as Admin'
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need to create admin account?{' '}
                <Link 
                  href="/ghost-register" 
                  className="text-primary hover:underline font-medium"
                >
                  Register Admin
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium mb-2">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage all registered users and their accounts
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium mb-2">Content Management</h3>
            <p className="text-sm text-muted-foreground">
              Monitor and manage all generated articles
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium mb-2">System Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View detailed system statistics and reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
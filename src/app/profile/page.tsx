'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Sparkles, Lock, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.user) {
        setForm(f => ({ ...f, name: data.user.name, email: data.user.email }));
      }
      setLoading(false);
    }
    if (status === 'authenticated') fetchProfile();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please login to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully!');
        setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
        update();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <User className="h-6 w-6" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <Input name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={50} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{session.user.role}</Badge>
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">{session.user.articlesGenerated} articles generated</span>
            </div>
            <div className="pt-2 border-t">
              <label className="block mb-1 font-medium">Change Password</label>
              <Input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="Current password" autoComplete="current-password" />
              <Input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="New password (min 6 chars)" autoComplete="new-password" minLength={6} className="mt-2" />
            </div>
            <Button type="submit" className="w-full flex items-center gap-2" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
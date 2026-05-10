'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ChevronLeft, Bell, Lock, Users, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUser(data);

      } catch (error) {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Change Password
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Please fill all fields');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setChanging(true);

      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Password updated successfully ✅');

      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      alert(err.message || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('userid');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">

      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <Card className="p-6 border border-border">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="font-semibold mt-1">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-semibold mt-1">{user?.email}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Preferences Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Preferences</h2>

          <Card className="p-6 border border-border mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 rounded-full transition ${notifications ? 'bg-accent' : 'bg-muted'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notifications ? 'translate-x-6' : 'translate-x-1'}`}
                  style={{ marginTop: '2px' }}
                />
              </button>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold">Location Tracking</p>
                  <p className="text-sm text-muted-foreground">Keep location enabled during walks</p>
                </div>
              </div>
              <button
                onClick={() => setLocationTracking(!locationTracking)}
                className={`relative inline-flex h-6 w-11 rounded-full transition ${locationTracking ? 'bg-accent' : 'bg-muted'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${locationTracking ? 'translate-x-6' : 'translate-x-1'}`}
                  style={{ marginTop: '2px' }}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* Security Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Security</h2>
          <Card className="p-6 border border-border">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/50 transition"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </Card>
        </section>

        {/* Contacts Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trusted Contacts</h2>
            <Link href="/contacts"> <Button variant="outline" size="sm">Add Contact</Button> </Link>
          </div>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground mb-4">Manage your safety network</p>
            <Link href="/contacts">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Users className="w-5 h-5 mr-2" /> Manage Contacts
              </Button>
            </Link>
          </Card>
        </section>
        {/* Logout Section */}
        <section className="mb-8">
          <Button
            onClick={handleLogout}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 py-6 font-semibold"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </section>

      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card w-[90%] max-w-md p-6 rounded-xl shadow-xl">

            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changing}
                  className="flex-1 bg-accent text-accent-foreground"
                >
                  {changing ? 'Updating...' : 'Update Password'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
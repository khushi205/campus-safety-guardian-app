'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ChevronLeft, Bell, Lock, Users, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const handleLogout = async () => {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
      // TODO: Connect to backend logout
      router.push('/');
    }
  };

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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <Card className="p-6 border border-border">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="font-semibold mt-1">John Doe</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-semibold mt-1">john@university.edu</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Edit Profile
              </Button>
            </div>
          </Card>
        </section>

        {/* Preferences Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Preferences</h2>

          {/* Notifications */}
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

          {/* Location Tracking */}
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
            <div className="space-y-3">
              <button className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/50 transition">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-accent" />
                  <div className="text-left">
                    <p className="font-semibold">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your password</p>
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/50 transition border-t border-border pt-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-accent" />
                  <div className="text-left">
                    <p className="font-semibold">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security</p>
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </button>
            </div>
          </Card>
        </section>

        {/* Contacts Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trusted Contacts</h2>
            <Link href="/contacts">
              <Button variant="outline" size="sm">Add Contact</Button>
            </Link>
          </div>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground mb-4">Manage your safety network</p>
            <Link href="/contacts">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Users className="w-5 h-5 mr-2" />
                Manage Contacts
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

        {/* App Info */}
        <Card className="p-6 border border-border bg-secondary/50 dark:bg-secondary/10 text-center">
          <p className="text-sm text-muted-foreground mb-1">Campus Safety Guardian</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 | Made for student safety</p>
        </Card>
      </div>
    </div>
  );
}

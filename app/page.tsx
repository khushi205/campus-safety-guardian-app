'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MapPin, Users, AlertCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary dark:from-background dark:via-background dark:to-secondary">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-accent" />
          <span className="font-bold text-xl">Campus Safety Guardian</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Safety at every step
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A virtual escort system that keeps you connected when walking on campus at night. Real-time location tracking, emergency alerts, and trusted contacts—all in one app.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
                  Start Now
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="px-8 py-6 text-lg bg-transparent">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20 h-96 flex items-center justify-center">
            <img src="https://frontpage.gcsu.edu/sites/default/files/2025-09/CampusSafety3.jpg" alt="" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-secondary/50 dark:bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <MapPin className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Real-time Location</h3>
              <p className="text-sm text-muted-foreground">Live GPS tracking visible to trusted contacts and campus security</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <AlertCircle className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Emergency Alerts</h3>
              <p className="text-sm text-muted-foreground">Automatic alert if you don't check in or reach your destination</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <Users className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Trusted Contacts</h3>
              <p className="text-sm text-muted-foreground">Manage your safety network and receive notifications</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <ShieldAlert className="w-10 h-10 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Safe Routes</h3>
              <p className="text-sm text-muted-foreground">View well-lit paths and campus safe zones on the map</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">Sign up and add your trusted contacts who will receive alerts</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Start Your Walk</h3>
                <p className="text-muted-foreground">Set your destination and timer before heading out</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">We Monitor Your Journey</h3>
                <p className="text-muted-foreground">Real-time location shared with trusted contacts and campus security</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Arrive Safely</h3>
                <p className="text-muted-foreground">Check in when you arrive, or we alert your network if needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Stay Safe?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of students who walk with confidence</p>
          <Link href="/signup">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 bg-secondary/50 dark:bg-secondary/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2026 Campus Safety Guardian. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

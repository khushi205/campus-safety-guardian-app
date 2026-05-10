'use client';

import React, { useEffect } from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShieldAlert, MapPin, Clock, Users, ChevronLeft } from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  number: string;
  relation: string;
}

export default function StartWalkPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('30');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
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

        if (!res.ok) throw new Error();

        const data = await res.json();
        setContacts(data.trustedContacts || []);

      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchContacts();
  }, []);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleStartWalk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!destination) {
      alert('Please enter a destination');
      setLoading(false);
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Select at least one contact');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/walks/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          estimatedTime: parseInt(duration),
          shareWith: selectedContacts,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Redirect to Dashboard after creating walk
      router.push('/dashboard');

   
      // router.push(`/walk/${data.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start walk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary dark:from-background dark:via-background dark:to-secondary">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-accent" />
            <span className="font-bold text-lg">Campus Safety Guardian</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="border border-border">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-2">Start Your Walk</h1>
            <p className="text-muted-foreground mb-8">Let your safety network know you're heading out</p>

            <form onSubmit={handleStartWalk} className="space-y-8">
              {/* Destination */}
              <div>
                <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Where are you going?
                </label>
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Library, Student Center, Dormitory"
                  className="py-3 text-base"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Estimated time
                </label>
                <div className="flex gap-3">
                  {['15', '30', '45', '60'].map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(min)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${duration === min
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-foreground border border-border hover:border-accent'
                        }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We'll send an alert if you don't check in by this time
                </p>
              </div>

              {/* Share With */}
              <div>
                <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Share with
                </label>
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <label key={contact._id} className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => handleContactToggle(contact._id)}
                        className="w-5 h-5 accent-accent"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.relation} • {contact.number}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full py-6 text-base bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Starting Walk...' : 'Start Walk'}
                </Button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Privacy:</strong> Your location will only be shared with the contacts you select. You can end the walk anytime from the map view.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, MapPin, Clock, Phone, AlertCircle, CheckCircle, ChevronLeft, Zap } from 'lucide-react';

interface WalkData {
  id: string;
  destination: string;
  startTime: Date;
  estimatedDuration: number;
  sharedWith: Array<{ name: string; phone: string }>;
  status: 'active' | 'completed';
}

export default function WalkMapPage() {
  const params = useParams();
  const router = useRouter();
  const walkId = params.id as string;

  const [walk, setWalk] = useState<WalkData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock walk data
  const mockWalk: WalkData = {
    id: walkId,
    destination: 'Library',
    startTime: new Date(Date.now() - 10 * 60000),
    estimatedDuration: 30,
    sharedWith: [
      { name: 'Mom', phone: '+1-555-0100' },
      { name: 'Campus Security', phone: '+1-555-0102' },
    ],
    status: 'active',
  };

  useEffect(() => {
    setWalk(mockWalk);
    setLoading(false);

    // Request location permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Use mock location
          setCurrentLocation({ lat: 40.8075, lng: -73.9626 });
        }
      );

      // Watch location updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update timer
  useEffect(() => {
    if (!walk) return;

    const timer = setInterval(() => {
      const now = new Date();
      const endTime = new Date(walk.startTime.getTime() + walk.estimatedDuration * 60000);
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [walk]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/walks/${walkId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Check-in failed');

      setWalk(prev => prev ? { ...prev, status: 'completed' } : null);
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Check-in failed');
    }
  };

  const handleEmergency = async () => {
    const confirmed = confirm('Send emergency alert to your contacts?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/walks/${walkId}/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Emergency alert failed');
      alert('Emergency alert sent to your contacts');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send alert');
    }
  };

  if (loading || !walk) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">Loading your walk...</p>
        </div>
      </div>
    );
  }

  const timeWarning = timeRemaining < 60 && timeRemaining > 0;
  const timeExpired = timeRemaining === 0;

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-background">
      {/* Top Bar */}
      <div className="border-b border-border bg-card shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">{walk.destination}</h1>
              <p className="text-sm text-muted-foreground">Active walk</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`text-center px-4 py-2 rounded-lg ${timeExpired ? 'bg-destructive/10 text-destructive' : timeWarning ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200' : 'bg-accent/10 text-accent'}`}>
            <p className="text-xs opacity-75 mb-1">Time remaining</p>
            <p className="text-2xl font-bold font-mono">{formatTime(timeRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 rounded-lg border border-border bg-secondary/50 dark:bg-secondary/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <MapPin className="w-16 h-16 text-accent/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Google Maps Integration</p>
              {currentLocation && (
                <p className="text-sm text-muted-foreground">
                  Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Emergency Button - Floating */}
          <button
            onClick={handleEmergency}
            className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90 flex items-center justify-center animate-pulse"
            title="Send emergency alert"
          >
            <Zap className="w-8 h-8" />
          </button>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Status Alert */}
          {timeExpired && (
            <Card className="p-4 border-destructive bg-destructive/5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Time Expired</p>
                  <p className="text-sm text-destructive/80">Please check in or your contacts will be alerted</p>
                </div>
              </div>
            </Card>
          )}

          {/* Shared With */}
          <Card className="p-4 border border-border">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              Shared With ({walk.sharedWith.length})
            </h3>
            <div className="space-y-2">
              {walk.sharedWith.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-secondary/50 dark:bg-secondary/20 rounded">
                  <span className="font-medium text-sm">{contact.name}</span>
                  <a href={`tel:${contact.phone}`} className="text-accent hover:underline text-xs">
                    <Phone className="w-4 h-4 inline" />
                  </a>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4 border border-border">
            <h3 className="font-bold mb-3">Journey Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-semibold">{walk.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Duration</span>
                <span className="font-semibold">{walk.estimatedDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-semibold">{walk.startTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2 mt-auto">
            <Button
              onClick={handleCheckIn}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 font-semibold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              I've Arrived
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 text-destructive hover:bg-destructive/10 bg-transparent"
            >
              End Walk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, AlertCircle, CheckCircle, ChevronLeft, Zap } from 'lucide-react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Dynamic import (Leaflet doesn't support SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface WalkData {
  id: string;
  destination: string;
  createdAt: Date;
  estimatedTime: number;
  sharedWith: Array<{ name: string; phone: string }>;
  status: 'Active' | 'Completed';
}

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

export default function WalkMapPage() {
  const params = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const walkId = params.id as string;

  const [walk, setWalk] = useState<WalkData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalk = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/walks/${walkId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch walk");

        const data = await res.json();

        setWalk({
          ...data,
          createdAt: new Date(data.createdAt),
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (walkId) fetchWalk();
  }, [walkId]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("SUCCESS CALLBACK RUNNING ✅");
          console.log("Latitude:", position.coords.latitude);
          console.log("Longitude:", position.coords.longitude);

          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("ERROR CALLBACK RUNNING ❌");
          console.log("Error code:", error.code);
          console.log("Error message:", error.message);

          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!walk) return;

    const startTime = new Date(walk.createdAt).getTime();
    const endTime = startTime + walk.estimatedTime * 60 * 1000;

    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(Math.floor(remaining / 1000));
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [walk]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndWalk = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/walks/${walkId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Completed' }),
      });

      if (!res.ok) throw new Error();
      router.push('/dashboard');
    } catch {
      alert('Failed to update walk');
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
    <div className="h-screen flex flex-col bg-background">
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

          <div className={`text-center px-4 py-2 rounded-lg ${timeExpired
            ? 'bg-destructive/10 text-destructive'
            : timeWarning
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-accent/10 text-accent'
            }`}>
            <p className="text-xs opacity-75 mb-1">Time remaining</p>
            <p className="text-2xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex-1 rounded-lg border border-border overflow-hidden relative">
          `{currentLocation && (
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={16}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ChangeMapView
                center={[currentLocation.lat, currentLocation.lng]}
              />

              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            </MapContainer>
          )}`

          <button
            onClick={handleEmergency}
            className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90 flex items-center justify-center animate-pulse"
          >
            <Zap className="w-8 h-8" />
          </button>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto">
          {timeExpired && (
            <Card className="p-4 border-destructive bg-destructive/5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Time Expired</p>
                  <p className="text-sm text-destructive/80">
                    Please check in or your contacts will be alerted
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4 border border-border">
            <h3 className="font-bold mb-3">Journey Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-semibold">{walk.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Duration</span>
                <span className="font-semibold">{walk.estimatedTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-semibold">
                  {new Date(walk.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-2 mt-auto">
            <Button
              onClick={handleEndWalk}
              className="w-full bg-accent text-accent-foreground py-6 font-semibold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              I've Arrived
            </Button>

            <Button
              onClick={handleEndWalk}
              variant="outline"
              className="w-full py-6 text-destructive"
            >
              End Walk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
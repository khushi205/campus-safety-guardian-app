'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, MapPin, Users, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalkSession {
  _id: string;
  destination: string;
  updatedAt: Date;
  estimatedTime: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  sharedWith: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<any>(null);
  const [walks, setWalks] = useState<WalkSession[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Profile + Walks
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch Profile
        const profileRes = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error();

        const profileData = await profileRes.json();
        setUser(profileData);

        // Fetch Walks
        const walksRes = await fetch(`${API_URL}/api/walks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const walksData = await walksRes.json();

        // clone first, then reverse (important!)
        const reversedWalks = [...walksData].reverse();

        setWalks(reversedWalks);

      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ End Walk
  const handleEndWalk = async (id: string, status: string) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/walks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: status }),
      });

      if (!res.ok) throw new Error();

      // Update UI
      setWalks(prev =>
        prev.map(w =>
          w._id === id ? { ...w, status: status } : w
        )
      );

    } catch {
      alert('Failed to update walk');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Completed':
        return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">

      <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-accent" />
            <span className="font-bold text-xl">Campus Safety Guardian</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">Your safety network is ready</p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link href="/walk/start">
            <Button className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-semibold">
              <MapPin className="w-5 h-5 mr-2" />
              Start a Walk
            </Button>
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Walks */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Walks</h2>
              <div className="space-y-4">
                {walks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No walks in progress</p>
                  </Card>
                ) : (
                  walks.map(walk => (
                    <Card key={walk._id} className="p-6 border border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(walk.status)}`}>
                            {getStatusIcon(walk.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{walk.destination}</h3>
                            <p className="text-sm text-muted-foreground">
                              Estimated duration: {walk.estimatedTime} min
                            </p>
                            <p className="text-sm text-muted-foreground">
                            {walk.updatedAt ? `Last updated: ${new Date(walk.updatedAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(walk.status)}`}>
                          {walk.status === 'Active' ? '🟢 Active' : walk.status === 'Completed' ? '✓ Completed' : 'Cancelled'}
                        </div>
                      </div>

                      {/* <div className="mb-4 text-sm text-muted-foreground">
                        Shared with: {walk.sharedWith.join(', ')}
                      </div> */}

                      {walk.status === 'Active' && (
                        <div className="flex gap-2">
                          <Link href={`/walk/${walk._id}`}>
                            <Button variant="outline" className="flex-1 bg-transparent">View Live Map</Button>
                          </Link>
                          <Button onClick={() => handleEndWalk(walk._id, 'Completed')} variant="outline" className="text-green-600 hover:bg-destructive/10 bg-transparent">
                            End Walk
                          </Button>
                          <Button onClick={() => handleEndWalk(walk._id, 'Cancelled')} variant="outline" className="text-destructive hover:bg-destructive/10 bg-transparent">
                            Cancel Walk
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trusted Contacts */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Trusted Contacts</h2>
                <Link href="/contacts">
                  <Button variant="outline" size="sm">Add</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {user.trustedContacts.map(contact => (
                  <Card key={contact._id} className="p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relation}</p>
                        <p className="text-xs text-muted-foreground">{contact.number}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Safety Tips */}
            <section>
              <h2 className="text-xl font-bold mb-4">Safety Tips</h2>
              <Card className="p-4 border border-accent/20 bg-accent/5">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Always share your walk with a trusted contact</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Set a realistic timer for your journey</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Check in when you arrive at your destination</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Keep your phone charged and location enabled</span>
                  </li>
                </ul>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

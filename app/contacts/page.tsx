'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ChevronLeft, Users, Plus, Trash2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Mom', phone: '+1-555-0100', email: 'mom@email.com', relationship: 'Parent' },
    { id: '2', name: 'Best Friend', phone: '+1-555-0101', email: 'friend@email.com', relationship: 'Friend' },
    { id: '3', name: 'Campus Security', phone: '+1-555-0102', email: 'security@university.edu', relationship: 'Security' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Friend',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Please fill in required fields');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      ...formData,
    };

    setContacts([...contacts, newContact]);
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: 'Friend',
    });
    setShowForm(false);
  };

  const handleDeleteContact = (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this contact?');
    if (confirmed) {
      setContacts(contacts.filter(c => c.id !== id));
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
            <h1 className="text-xl font-bold">Trusted Contacts</h1>
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Add Contact Form */}
        {showForm && (
          <Card className="p-6 border border-border mb-8">
            <h2 className="text-xl font-bold mb-6">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mom, Best Friend"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1-555-0000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Relationship</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background dark:bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Parent</option>
                  <option>Friend</option>
                  <option>Sibling</option>
                  <option>Partner</option>
                  <option>Security</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 font-semibold"
                >
                  Add Contact
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-6 bg-transparent"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Contacts List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Contacts ({contacts.length})</h2>

          {contacts.length === 0 ? (
            <Card className="p-8 text-center border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No contacts yet</p>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <Card key={contact.id} className="p-5 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{contact.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{contact.relationship} • {contact.phone}</p>
                          {contact.email && <p>{contact.email}</p>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                      title="Delete contact"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <Card className="mt-8 p-4 bg-accent/5 border border-accent/20">
          <p className="text-sm text-foreground">
            <strong>Tip:</strong> Make sure your contacts' phone numbers are correct. They'll receive alerts if your timer expires or you send an emergency signal.
          </p>
        </Card>
      </div>
    </div>
  );
}

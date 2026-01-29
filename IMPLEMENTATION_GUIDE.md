# Campus Safety Guardian - Implementation Guide

## Overview

This guide provides step-by-step instructions for setting up and deploying Campus Safety Guardian. The application uses Next.js for the frontend/backend, Firebase for real-time data and authentication, Google Maps for location services, and Twilio for SMS notifications.

## Phase 1: Frontend Setup (Complete ✅)

### What's Been Built

The frontend includes all user-facing pages and components:

1. **Landing Page** (`/app/page.tsx`)
   - Feature overview
   - How it works section
   - Call-to-action buttons
   - Professional design with dark mode support

2. **Authentication Pages**
   - Sign Up (`/app/signup/page.tsx`)
   - Login (`/app/login/page.tsx`)
   - Form validation
   - Error handling

3. **Dashboard** (`/app/dashboard/page.tsx`)
   - Walk history
   - Active walk status
   - Quick start walk button
   - Trusted contacts sidebar
   - Safety tips

4. **Walk Management**
   - Start Walk Form (`/app/walk/start/page.tsx`)
   - Live Walk Map (`/app/walk/[id]/page.tsx`)
   - Timer countdown
   - Emergency button
   - Check-in button

5. **Contacts Management** (`/app/contacts/page.tsx`)
   - View all contacts
   - Add new contact
   - Delete contact
   - Contact details

6. **Settings** (`/app/settings/page.tsx`)
   - Profile settings
   - Preferences
   - Security options
   - Logout

### Design System

All components use a cohesive design system:

**Color Palette:**
- Primary (Dark Blue): `#1a3a52`
- Accent (Green): `#10b981`
- Destructive (Red): `#dc2626`
- Background: Light/Dark variants
- Text: Semantic colors

**Typography:**
- Font Family: Geist (sans-serif)
- Scale: h1-h6, body, small, xs
- Line Heights: 1.4-1.6

**Spacing:**
- Consistent Tailwind scale
- 4px base unit
- Flexbox-based layouts

### Run Frontend

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Phase 2: Firebase Setup (Next Steps)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it "Campus Safety Guardian"
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Create Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Select region (closest to your university)
4. Start in **Production mode**
5. Create

### Step 3: Enable Authentication

1. Click "Authentication" in left menu
2. Click "Get started"
3. Enable "Email/Password"
4. Optional: Enable "Google Sign-in" for convenience

### Step 4: Get API Keys

1. Click "Project Settings" (gear icon)
2. Under "Your apps", create a Web app
3. Copy the firebaseConfig
4. Add to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

### Step 5: Set Security Rules

1. In Firestore, click "Rules" tab
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /walks/{walkId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /contacts/{contactId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /emergency_logs/{docId} {
      allow write: if request.auth.uid != null;
      allow read: if request.auth.token.admin == true;
    }
  }
}
```

3. Click "Publish"

### Step 6: Create Database Collections

Use Firestore Console to create these collections:

**1. users** (auto-created on first signup)
- uid (String)
- name (String)
- email (String)
- phone (String)
- createdAt (Timestamp)
- preferences (Map)

**2. walks** (auto-created on first walk)
- userId (String)
- destination (String)
- startTime (Timestamp)
- endTime (Timestamp)
- estimatedDuration (Number)
- status (String: active/completed/cancelled)
- sharedWith (Array of Strings)
- locations (Array of Maps)
- emergencyAlert (Boolean)

**3. contacts** (auto-created on first contact add)
- userId (String)
- name (String)
- phone (String)
- email (String)
- relationship (String)
- createdAt (Timestamp)

**4. emergency_logs** (auto-created on emergency)
- userId (String)
- walkId (String)
- timestamp (Timestamp)
- location (Map)
- contactsNotified (Number)
- resolved (Boolean)

---

## Phase 3: Authentication Implementation

### Backend Routes

Three API routes handle authentication:

**POST /api/auth/signup** (`/app/api/auth/signup/route.ts`)
```typescript
// Already has stub implementation
// TODO: Connect to Firebase
const user = await createUserWithEmailAndPassword(email, password);
await saveUserProfile(user.uid, { name, email });
```

**POST /api/auth/login** (`/app/api/auth/login/route.ts`)
```typescript
// Already has stub implementation
// TODO: Connect to Firebase
const user = await signInWithEmailAndPassword(email, password);
const token = await user.getIdToken();
```

**POST /api/auth/logout** (needs to be created)
```typescript
// TODO: Implement logout endpoint
```

### Frontend Integration

Update signup and login pages to use the API client:

In `/app/signup/page.tsx`:
```typescript
import { api } from '@/lib/api-client';

const response = await api.auth.signup({
  name: formData.name,
  email: formData.email,
  password: formData.password,
});

if (response.success) {
  router.push('/dashboard');
}
```

### Testing Authentication

1. Sign up with test email: `test@university.edu`
2. Password: `TestPassword123`
3. Should redirect to dashboard
4. Sign out from settings
5. Login again

---

## Phase 4: Walk Management

### Database Operations

Using Firebase helpers from `/lib/firebase.ts`:

```typescript
// Start a walk
const walkId = await startWalk(userId, {
  destination: "Library",
  estimatedDuration: 30,
  sharedWith: ["contact1", "contact2"]
});

// Update location
await updateWalkLocation(walkId, {
  latitude: 40.8075,
  longitude: -73.9626,
  accuracy: 10
});

// Complete walk
await completeWalk(walkId);
```

### Real-Time Location Updates

In `/app/walk/[id]/page.tsx`:

```typescript
// Watch user's position
useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      updateWalkLocation(walkId, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    }
  );
  return () => navigator.geolocation.clearWatch(watchId);
}, [walkId]);
```

### Timer Implementation

Already implemented with countdown logic:
- Updates every second
- Shows warning at < 1 minute
- Shows expired at 0 seconds
- Can be stopped manually

---

## Phase 5: Emergency Alert System

### Implementation Steps

1. **Create emergency endpoint** (`/app/api/walks/[id]/emergency/route.ts`)
   - Verify user ownership
   - Get latest location
   - Send SMS to contacts
   - Notify campus security
   - Log emergency event

2. **Send SMS via Twilio**

Get credentials at https://www.twilio.com/console:
```typescript
import twilio from 'twilio';

const client = twilio(accountSid, authToken);
await client.messages.create({
  body: `EMERGENCY: ${studentName} triggered alert at ${location}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: contact.phone,
});
```

3. **Send Push Notifications**

Using Firebase Cloud Messaging:
```typescript
import admin from 'firebase-admin';

await admin.messaging().send({
  token: contactToken,
  notification: {
    title: 'Safety Alert',
    body: `${studentName} needs help`,
  },
});
```

4. **Log Emergency Event**

```typescript
await logEmergency(userId, walkId, location, contactsNotified);
```

---

## Phase 6: Notifications Setup

### Firebase Cloud Messaging (FCM)

1. In Firebase Console, click "Cloud Messaging"
2. Copy "Server API Key"
3. Add to environment variables

### Twilio SMS

1. Go to https://www.twilio.com/console
2. Get Account SID and Auth Token
3. Get a Twilio phone number
4. Add to `.env.local`:

```
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Browser Push Notifications

Request permission when user starts walk:

```typescript
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // Subscribe to notifications
    }
  });
}
```

---

## Phase 7: Google Maps Integration

### Get API Key

1. Go to https://console.cloud.google.com
2. Create new project
3. Search for "Maps JavaScript API"
4. Click "Enable"
5. Go to "Credentials"
6. Create API Key
7. Add to `.env.local`:

```
GOOGLE_MAPS_API_KEY=your_key_here
```

### Add Maps Component

In `/app/walk/[id]/page.tsx`, replace placeholder with:

```typescript
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const { isLoaded } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
});

return (
  <GoogleMap
    mapContainerClassName="h-full w-full"
    center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
    zoom={15}
  >
    <MarkerF position={{ lat: currentLocation.lat, lng: currentLocation.lng }} />
  </GoogleMap>
);
```

### Display Safe Zones

Create a safe zones collection in Firestore with polygon coordinates, then render them on the map.

---

## Phase 8: Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select repository

3. **Add Environment Variables**
   - Click "Settings"
   - Go to "Environment Variables"
   - Add all variables from `.env.local`

4. **Deploy**
   - Vercel will auto-deploy on push
   - View at `your-project.vercel.app`

### Deploy Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
firebase deploy --only functions
```

---

## Integration Checklist

### Backend Integration
- [ ] Firebase authentication connected
- [ ] Firestore rules deployed
- [ ] User profile creation working
- [ ] Walk session creation working
- [ ] Location tracking functional
- [ ] Emergency alert endpoint functional

### Notifications
- [ ] Twilio SMS working
- [ ] Firebase Cloud Messaging setup
- [ ] Push notifications functional
- [ ] SMS alerts to contacts

### Maps
- [ ] Google Maps API integrated
- [ ] Real-time location display
- [ ] Safe zones visualization
- [ ] Route tracking

### Testing
- [ ] Create account flow
- [ ] Login/logout flow
- [ ] Start walk flow
- [ ] Emergency alert flow
- [ ] Check-in flow

---

## Testing Checklist

### Manual Testing

1. **Authentication**
   - [ ] Sign up with new email
   - [ ] Login with credentials
   - [ ] Logout successfully
   - [ ] Password validation working

2. **Walk Management**
   - [ ] Start walk with destination
   - [ ] Select contacts
   - [ ] Timer counting down
   - [ ] Location updating
   - [ ] Check-in successful
   - [ ] Walk appears in history

3. **Contacts**
   - [ ] Add new contact
   - [ ] Edit contact info
   - [ ] Delete contact
   - [ ] Contact appears in walk share list

4. **Emergency**
   - [ ] Click emergency button
   - [ ] SMS sent to contacts (check Twilio logs)
   - [ ] Emergency logged in database
   - [ ] Can verify in Firestore

5. **Dark Mode**
   - [ ] Toggle dark mode
   - [ ] All colors correct
   - [ ] No flashing
   - [ ] Text readable

### Performance Testing

1. **Load Times**
   - [ ] Landing page < 2s
   - [ ] Dashboard < 2s
   - [ ] Map view < 2s

2. **Location Updates**
   - [ ] Updates every 10-15s
   - [ ] No missed updates
   - [ ] Accurate coordinates

3. **Mobile**
   - [ ] Responsive on mobile
   - [ ] Touch targets large enough
   - [ ] Geolocation working

---

## Troubleshooting

### Firebase Connection Issues

**Problem**: "Firebase config not found"
**Solution**: Check `.env.local` has all FIREBASE_* variables

**Problem**: "User not found" on login
**Solution**: Create user first via signup, or check Firestore users collection

### Location Tracking Issues

**Problem**: "Geolocation not available"
**Solution**: 
- Ensure HTTPS (required for geolocation)
- Check browser permissions
- Use test coordinates in development

**Problem**: "Location updates not syncing"
**Solution**:
- Check Firestore database permissions
- Verify RLS rules are correct
- Check network connectivity

### Map Issues

**Problem**: "Map not displaying"
**Solution**:
- Verify Google Maps API key
- Check API is enabled in Google Cloud
- Ensure billing is enabled

**Problem**: "API key invalid"
**Solution**:
- Regenerate API key in Google Cloud Console
- Wait 5 minutes for changes to propagate

---

## Next Steps

1. **Complete Firebase Setup** (Phase 2)
   - Create Firebase project
   - Set up Firestore
   - Configure authentication

2. **Implement Authentication** (Phase 3)
   - Connect signup/login to Firebase
   - Test auth flow

3. **Build Walk Management** (Phase 4)
   - Implement location tracking
   - Create API endpoints

4. **Setup Notifications** (Phase 5-6)
   - Configure Twilio
   - Setup Firebase Cloud Messaging

5. **Integrate Maps** (Phase 7)
   - Add Google Maps component
   - Display real-time location

6. **Deploy** (Phase 8)
   - Push to GitHub
   - Deploy to Vercel
   - Configure production environment

---

## Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Google Maps Docs**: https://developers.google.com/maps/documentation
- **Twilio Docs**: https://www.twilio.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## Questions?

For implementation support, refer to:
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed backend guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project architecture
- [README.md](./README.md) - Main documentation

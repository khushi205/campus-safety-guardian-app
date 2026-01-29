# Campus Safety Guardian - Backend Setup Guide

## Overview
This document outlines the backend setup and API implementation for Campus Safety Guardian. The backend uses Node.js/Next.js with Firebase for real-time data management and authentication.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Next.js 15+ (App Router)
- **Database**: Firebase Firestore (Real-time database)
- **Authentication**: Firebase Auth
- **Notifications**: Firebase Cloud Messaging (FCM) + Twilio for SMS
- **Location Services**: Google Maps API
- **Storage**: Firebase Storage (for logs and media)

## Firebase Setup

### 1. Create Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project
firebase init
```

### 2. Configure Firestore Database

Create the following collections:

#### **users** Collection
```javascript
{
  uid: "string",  // Firebase UID
  name: "string",
  email: "string",
  phone: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  preferences: {
    notifications: "boolean",
    locationTracking: "boolean",
  }
}
```

#### **walks** Collection
```javascript
{
  id: "string",
  userId: "string",  // Reference to users
  destination: "string",
  startTime: "timestamp",
  endTime: "timestamp (null if active)",
  estimatedDuration: "number (minutes)",
  status: "enum: active, completed, cancelled",
  sharedWith: ["string"],  // Contact IDs
  locations: [
    {
      latitude: "number",
      longitude: "number",
      timestamp: "timestamp",
      accuracy: "number"
    }
  ],
  emergencyAlert: "boolean"
}
```

#### **contacts** Collection
```javascript
{
  id: "string",
  userId: "string",  // Reference to users
  name: "string",
  phone: "string",
  email: "string",
  relationship: "enum: Parent, Friend, Sibling, Partner, Security, Other",
  createdAt: "timestamp"
}
```

#### **emergency_logs** Collection
```javascript
{
  id: "string",
  userId: "string",  // Reference to users
  walkId: "string",  // Reference to walks
  timestamp: "timestamp",
  location: {
    latitude: "number",
    longitude: "number"
  },
  contactsNotified: "number",
  resolved: "boolean"
}
```

### 3. Set Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_SERVICE_ACCOUNT_KEY=your_service_account_json

GOOGLE_MAPS_API_KEY=your_maps_api_key
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Creates a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@university.edu"
  },
  "token": "auth_token"
}
```

#### POST `/api/auth/login`
Authenticates user credentials.

**Request:**
```json
{
  "email": "john@university.edu",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "john@university.edu"
  },
  "token": "auth_token"
}
```

#### POST `/api/auth/logout`
Logs out the current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Walk Management Endpoints

#### POST `/api/walks/start`
Initiates a new walk session.

**Request:**
```json
{
  "destination": "Library",
  "estimatedDuration": 30,
  "sharedWith": ["contact_id_1", "contact_id_2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "walk_1234567890",
  "destination": "Library",
  "estimatedDuration": 30,
  "startTime": "2024-01-15T20:30:00Z",
  "status": "active"
}
```

#### POST `/api/walks/:id/location`
Updates user's real-time location during a walk.

**Request:**
```json
{
  "latitude": 40.8075,
  "longitude": -73.9626,
  "accuracy": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```

#### POST `/api/walks/:id/checkin`
Marks walk as completed.

**Response (200):**
```json
{
  "success": true,
  "message": "Walk completed successfully",
  "walkId": "walk_1234567890",
  "status": "completed",
  "completedAt": "2024-01-15T21:00:00Z"
}
```

#### POST `/api/walks/:id/emergency`
Sends emergency alert to all shared contacts and campus security.

**Response (200):**
```json
{
  "success": true,
  "message": "Emergency alert sent to all contacts",
  "walkId": "walk_1234567890",
  "alertTime": "2024-01-15T20:45:00Z",
  "contactsNotified": 3
}
```

#### GET `/api/walks/:id`
Retrieves walk session details.

**Response (200):**
```json
{
  "id": "walk_1234567890",
  "destination": "Library",
  "startTime": "2024-01-15T20:30:00Z",
  "estimatedDuration": 30,
  "status": "active",
  "sharedWith": ["contact_id_1", "contact_id_2"],
  "locations": [
    {
      "latitude": 40.8075,
      "longitude": -73.9626,
      "timestamp": "2024-01-15T20:30:00Z",
      "accuracy": 10
    }
  ]
}
```

### Contact Management Endpoints

#### POST `/api/contacts`
Adds a new trusted contact.

**Request:**
```json
{
  "name": "Mom",
  "phone": "+1-555-0100",
  "email": "mom@email.com",
  "relationship": "Parent"
}
```

**Response (201):**
```json
{
  "success": true,
  "id": "contact_1234567890",
  "name": "Mom",
  "relationship": "Parent"
}
```

#### GET `/api/contacts`
Retrieves all trusted contacts for the user.

**Response (200):**
```json
[
  {
    "id": "contact_1",
    "name": "Mom",
    "phone": "+1-555-0100",
    "email": "mom@email.com",
    "relationship": "Parent"
  },
  {
    "id": "contact_2",
    "name": "Best Friend",
    "phone": "+1-555-0101",
    "email": "friend@email.com",
    "relationship": "Friend"
  }
]
```

#### DELETE `/api/contacts/:id`
Removes a trusted contact.

**Response (200):**
```json
{
  "success": true,
  "message": "Contact deleted"
}
```

## Authentication & Security

### Firebase Auth Integration

```typescript
// Example: Firebase Auth in Next.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
```

### Protected Routes

All API endpoints (except signup/login) should verify the user's auth token:

```typescript
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Process request with authenticated user
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

## Real-Time Location Tracking

### WebSocket Implementation (Firebase Realtime Database)

For real-time location updates:

```typescript
// Client-side: Listen to location updates
import { getDatabase, ref, onValue } from 'firebase/database';

const db = getDatabase();
const walkRef = ref(db, `walks/${walkId}/location`);

onValue(walkRef, (snapshot) => {
  const location = snapshot.val();
  updateMapWithLocation(location);
});
```

### Batch Location Updates

To optimize performance, batch location updates every 10-15 seconds:

```typescript
// Client-side batching
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    sendLocationUpdate(position.coords);
  });
}, 15000);
```

## Notifications

### Firebase Cloud Messaging (FCM)

```typescript
// Send notification to shared contacts
import { messaging } from '@/lib/firebase';
import { sendMessage } from 'firebase-admin/messaging';

await sendMessage({
  token: contactToken,
  notification: {
    title: 'Walk Alert',
    body: `${studentName} has started a walk to ${destination}`,
  },
  data: {
    walkId: walkId,
    action: 'view_walk',
  },
});
```

### SMS Notifications via Twilio

```typescript
// Send SMS for emergencies
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `EMERGENCY: ${studentName} has triggered a safety alert.`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: contactPhone,
});
```

## Emergency Alert System

### Auto-Alert on Timer Expiration

```typescript
// Scheduled job to check expired walks
import * as functions from 'firebase-functions';

export const checkExpiredWalks = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = new Date();
    const expiredWalks = await db.collection('walks')
      .where('status', '==', 'active')
      .where('endTime', '<', now)
      .get();

    for (const walk of expiredWalks.docs) {
      await triggerEmergencyAlert(walk.id);
    }
  });
```

## Row-Level Security (RLS)

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can read/write their own walks
    match /walks/{walkId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Users can read/write their own contacts
    match /contacts/{contactId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Security logs - admin only
    match /emergency_logs/{docId} {
      allow read: if request.auth.token.admin == true;
      allow write: if request.auth.uid != null;
    }
  }
}
```

## Deployment

### To Vercel

```bash
# Add environment variables in Vercel dashboard
# Settings > Environment Variables

# Deploy
git push origin main
```

### Firebase Functions Deployment

```bash
firebase deploy --only functions
```

## Performance Optimization

1. **Location Batching**: Update location every 10-15 seconds (not every second)
2. **Query Optimization**: Add indexes to frequently queried fields
3. **Caching**: Use browser cache for static data (contacts list)
4. **Lazy Loading**: Load walk history on demand

## Monitoring & Logging

```typescript
// Log important events
import { logging } from '@/lib/firebase';

logging.info('Walk started', {
  userId: uid,
  walkId: walkId,
  destination: destination,
});

logging.error('Emergency alert sent', {
  userId: uid,
  walkId: walkId,
  timestamp: new Date(),
});
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
firebase emulators:start
```

## Troubleshooting

### Location Permission Issues
- Ensure HTTPS is used (required for geolocation API)
- Request permission explicitly when walk starts
- Provide fallback mock location for testing

### Firebase Connection Issues
- Verify API keys in `.env.local`
- Check Firebase project settings
- Ensure Firestore database is running

### Notification Delivery
- Verify device tokens are stored correctly
- Check Firebase Cloud Messaging quota
- Test with Firebase Console

## Support

For issues with the backend setup, contact:
- Firebase Support: https://firebase.google.com/support
- Google Maps Support: https://developers.google.com/maps/support
- Twilio Support: https://www.twilio.com/help

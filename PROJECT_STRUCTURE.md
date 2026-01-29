# Campus Safety Guardian - Project Structure

## Directory Overview

```
campus-safety-guardian/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── signup/
│   │       └── page.tsx              # Sign up page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts          # Login endpoint
│   │   │   ├── logout/
│   │   │   │   └── route.ts          # Logout endpoint
│   │   │   └── signup/
│   │   │       └── route.ts          # Sign up endpoint
│   │   ├── contacts/
│   │   │   └── route.ts              # Contact management endpoints
│   │   └── walks/
│   │       ├── start/
│   │       │   └── route.ts          # Start walk endpoint
│   │       ├── [id]/
│   │       │   ├── checkin/
│   │       │   │   └── route.ts      # Check-in endpoint
│   │       │   ├── emergency/
│   │       │   │   └── route.ts      # Emergency alert endpoint
│   │       │   ├── location/
│   │       │   │   └── route.ts      # Location update endpoint
│   │       │   └── route.ts          # Get walk details
│   ├── contacts/
│   │   └── page.tsx                  # Trusted contacts management
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── settings/
│   │   └── page.tsx                  # User settings
│   ├── walk/
│   │   ├── [id]/
│   │   │   └── page.tsx              # Live walk map
│   │   └── start/
│   │       └── page.tsx              # Start walk form
│   ├── globals.css                   # Global styles & design tokens
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── [other components]
├── hooks/
│   └── use-mobile.tsx                # Mobile detection hook
├── lib/
│   ├── firebase.ts                   # Firebase initialization (TODO)
│   ├── api-client.ts                 # API client helpers (TODO)
│   └── utils.ts                      # Utility functions
├── public/
│   └── [images & assets]
├── .env.local                        # Environment variables
├── .env.example                      # Example environment variables
├── BACKEND_SETUP.md                  # Backend setup guide
├── PROJECT_STRUCTURE.md              # This file
├── README.md                         # Main documentation
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
```

## Component Hierarchy

### Page Structure

```
┌─ Landing (page.tsx)
├─ Sign Up (signup/page.tsx)
├─ Login (login/page.tsx)
├─ Dashboard (dashboard/page.tsx)
│  ├─ Walk History
│  ├─ Active Walks
│  └─ Trusted Contacts (sidebar)
├─ Start Walk (walk/start/page.tsx)
├─ Live Walk Map (walk/[id]/page.tsx)
│  ├─ Map Container
│  ├─ Timer
│  ├─ Shared Contacts
│  ├─ Emergency Button
│  └─ Check-in Button
├─ Contacts Management (contacts/page.tsx)
│  ├─ Contact List
│  └─ Add Contact Form
└─ Settings (settings/page.tsx)
   ├─ Profile Settings
   ├─ Preferences
   ├─ Security
   └─ Logout
```

## API Route Structure

### Authentication Routes
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Walk Management Routes
- `POST /api/walks/start` - Start new walk
- `GET /api/walks/:id` - Get walk details
- `POST /api/walks/:id/location` - Update location
- `POST /api/walks/:id/checkin` - Check in (complete walk)
- `POST /api/walks/:id/emergency` - Send emergency alert
- `POST /api/walks/:id/end` - End walk manually

### Contact Management Routes
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

## State Management

### Global State (for future implementation)
```typescript
// Using SWR for client-side data fetching and caching
import useSWR from 'swr';

// Example:
const { data: user } = useSWR('/api/user/profile');
const { data: walks } = useSWR('/api/walks');
const { data: contacts } = useSWR('/api/contacts');
```

### Component State
- Form inputs: `useState`
- Real-time data: `useEffect` with API polling
- Location tracking: `useEffect` with geolocation API

## Styling System

### Color Tokens
```css
/* Light Mode */
--background: #ffffff
--foreground: #1a1a1a
--primary: #1a3a52 (dark blue)
--accent: #10b981 (emerald green)
--destructive: #dc2626 (red)

/* Dark Mode */
--background: #0f1419
--foreground: #f5f5f5
--primary: #1a3a52
--accent: #10b981
--destructive: #ef4444
```

### Typography
- **Font Family**: Geist (sans-serif)
- **Headings**: font-bold
- **Body**: font-normal with leading-relaxed
- **Small Text**: text-sm, text-xs

### Spacing
Uses Tailwind's spacing scale:
- `p-4`, `m-2`, `gap-4`, etc.
- Consistent 4px base unit

## Feature Implementation Checklist

### Phase 1: Frontend UI (Complete ✓)
- [x] Landing page with features overview
- [x] Authentication pages (signup/login)
- [x] Dashboard with walk history
- [x] Start walk form
- [x] Live walk map interface
- [x] Trusted contacts management
- [x] Settings page
- [x] Dark mode support

### Phase 2: Backend API (In Progress)
- [ ] Firebase authentication integration
- [ ] Real-time location tracking
- [ ] Firestore database setup
- [ ] Walk session management
- [ ] Contact management backend
- [ ] Emergency alert system
- [ ] Notification service (FCM + SMS)
- [ ] Timer-based auto-alert

### Phase 3: Real-time Features
- [ ] Google Maps API integration
- [ ] WebSocket for live location
- [ ] Push notifications
- [ ] SMS alerts
- [ ] Campus security integration

### Phase 4: Advanced Features
- [ ] Safe zone mapping
- [ ] Walking history analytics
- [ ] Export walk reports
- [ ] Campus-wide statistics
- [ ] Admin dashboard

## Key Implementation Notes

### Location Tracking
```typescript
// Geolocation API usage
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Send to backend every 10-15 seconds
  },
  (error) => console.error(error)
);
```

### Timer Logic
- Countdown timer starts on walk initiation
- Updates every second
- Triggers warning at < 1 minute remaining
- Triggers emergency alert at 0 seconds

### Emergency System
1. User clicks emergency button or timer expires
2. Current location captured from geolocation API
3. SMS sent via Twilio to all shared contacts
4. Push notification sent via Firebase Cloud Messaging
5. Campus security alerted with location data
6. Walk marked with emergency status
7. Emergency logged for audit trail

## Database Schema

### Firestore Collections

**users/**
- uid (auto)
- name
- email
- phone
- createdAt
- preferences {}

**walks/**
- id (auto)
- userId
- destination
- startTime
- endTime
- estimatedDuration
- status (active|completed|cancelled)
- sharedWith [contactIds]
- locations [{ lat, lng, timestamp, accuracy }]
- emergencyAlert

**contacts/**
- id (auto)
- userId
- name
- phone
- email
- relationship

**emergency_logs/**
- id (auto)
- userId
- walkId
- timestamp
- location {}
- contactsNotified
- resolved

## Environment Variables

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Service Account (backend only)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Performance Metrics

- **Page Load**: < 2 seconds
- **Location Update**: Every 10-15 seconds
- **API Response**: < 500ms
- **Map Rendering**: < 1 second
- **Mobile Optimization**: Mobile-first responsive design

## Security Considerations

1. **Authentication**
   - Firebase Auth handles password hashing
   - JWT tokens for API calls
   - HTTP-only cookies for sessions

2. **Authorization**
   - Firestore RLS policies
   - User can only access own data
   - Contact data protected

3. **Data Encryption**
   - HTTPS only
   - Location data encrypted in transit
   - PII protected in database

4. **API Security**
   - Token validation on all protected routes
   - Rate limiting on authentication endpoints
   - Input validation on all forms

## Testing Strategy

### Unit Tests
- Utility functions
- Component rendering
- Form validation

### Integration Tests
- Auth flow (signup → login → dashboard)
- Walk flow (start → track → check-in)
- Contact management CRUD

### E2E Tests
- Full user journey
- Emergency alert system
- Location tracking accuracy

## Development Guidelines

### Code Style
- TypeScript for type safety
- Consistent naming conventions
- Comments for complex logic
- TODO markers for future work

### Git Workflow
1. Create feature branch from main
2. Implement feature with tests
3. Submit PR with description
4. Code review before merge
5. Deploy to production

### Naming Conventions
- **Files**: kebab-case (e.g., start-walk.tsx)
- **Components**: PascalCase (e.g., StartWalk)
- **Functions**: camelCase (e.g., handleStartWalk)
- **Constants**: UPPER_SNAKE_CASE (e.g., MAX_WALK_DURATION)

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Google Maps API key obtained
- [ ] Twilio account set up
- [ ] Database schema created
- [ ] Security rules deployed
- [ ] API endpoints tested
- [ ] Frontend built and tested
- [ ] Performance optimized
- [ ] SEO metadata added
- [ ] Analytics configured
- [ ] Error logging enabled
- [ ] Backup strategy implemented

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Google Maps API**: https://developers.google.com/maps
- **Twilio API**: https://www.twilio.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

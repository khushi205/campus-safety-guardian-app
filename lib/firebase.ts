/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes the Firebase app and exports commonly used services.
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Messaging (for push notifications) - only available in browser
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not available:', error);
  }
}

export { messaging };
export { app };

/**
 * Authentication Helpers
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  UserCredential 
} from 'firebase/auth';

export async function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  return signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Firestore Helpers
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';

/**
 * Save user profile data
 */
export async function saveUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    preferences?: {
      notifications: boolean;
      locationTracking: boolean;
    };
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get user profile
 */
export async function getUserProfile(uid: string): Promise<DocumentData | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

/**
 * Start a walk session
 */
export async function startWalk(
  userId: string,
  data: {
    destination: string;
    estimatedDuration: number;
    sharedWith: string[];
  }
): Promise<string> {
  const walkRef = await addDoc(collection(db, 'walks'), {
    userId,
    ...data,
    startTime: Timestamp.now(),
    endTime: null,
    status: 'active',
    locations: [],
    emergencyAlert: false,
  });
  return walkRef.id;
}

/**
 * Get walk details
 */
export async function getWalk(walkId: string): Promise<DocumentData | null> {
  const walkRef = doc(db, 'walks', walkId);
  const walkSnap = await getDoc(walkRef);
  return walkSnap.exists() ? walkSnap.data() : null;
}

/**
 * Update walk location
 */
export async function updateWalkLocation(
  walkId: string,
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }
): Promise<void> {
  const walkRef = doc(db, 'walks', walkId);
  const walk = await getWalk(walkId);
  
  if (walk && walk.locations) {
    await updateDoc(walkRef, {
      locations: [
        ...walk.locations,
        {
          ...location,
          timestamp: Timestamp.now(),
        },
      ],
    });
  }
}

/**
 * Complete walk session
 */
export async function completeWalk(walkId: string): Promise<void> {
  const walkRef = doc(db, 'walks', walkId);
  await updateDoc(walkRef, {
    status: 'completed',
    endTime: Timestamp.now(),
  });
}

/**
 * Get user's contacts
 */
export async function getUserContacts(userId: string): Promise<DocumentData[]> {
  const q = query(
    collection(db, 'contacts'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Add trusted contact
 */
export async function addContact(
  userId: string,
  data: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
  }
): Promise<string> {
  const contactRef = await addDoc(collection(db, 'contacts'), {
    userId,
    ...data,
    createdAt: Timestamp.now(),
  });
  return contactRef.id;
}

/**
 * Delete contact
 */
export async function deleteContact(contactId: string): Promise<void> {
  const contactRef = doc(db, 'contacts', contactId);
  await deleteDoc(contactRef);
}

/**
 * Log emergency event
 */
export async function logEmergency(
  userId: string,
  walkId: string,
  location: {
    latitude: number;
    longitude: number;
  },
  contactsNotified: number
): Promise<void> {
  await addDoc(collection(db, 'emergency_logs'), {
    userId,
    walkId,
    timestamp: Timestamp.now(),
    location,
    contactsNotified,
    resolved: false,
  });
}

/**
 * Get user's active walk
 */
export async function getUserActiveWalk(userId: string): Promise<DocumentData | null> {
  const q = query(
    collection(db, 'walks'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.docs.length > 0) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  return null;
}

/**
 * Get user's walk history
 */
export async function getWalkHistory(userId: string, limit: number = 10): Promise<DocumentData[]> {
  const q = query(
    collection(db, 'walks'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => b.startTime.toDate() - a.startTime.toDate())
    .slice(0, limit);
}

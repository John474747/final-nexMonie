'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured } from "./config";

/**
 * Singleton pattern for Firebase Initialization
 * Prevents "Firebase App already exists" errors and initialization crashes.
 */
let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
};

export const getFirebaseAuth = (): Auth | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
};

export const getFirebaseDb = (): Firestore | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
};

export const getFirebaseStorage = (): FirebaseStorage | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getStorage(app);
};

// Instance getters for simplified hook access
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';

export default app;

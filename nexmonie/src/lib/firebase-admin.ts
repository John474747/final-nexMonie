/**
 * Firebase Admin SDK singleton for server-side operations.
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON env var (contents of serviceAccountKey.json).
 */
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;

  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON not set. Server-side writes disabled.');
      return null;
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    if (!getApps().length) {
      adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
      const { getApp } = require('firebase-admin/app');
      adminApp = getApp();
    }

    adminDb = getFirestore(adminApp!);
    return adminDb;
  } catch (err) {
    console.error('[Firebase Admin] Initialization failed:', err);
    return null;
  }
}

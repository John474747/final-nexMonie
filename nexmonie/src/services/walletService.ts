
'use client';

import { db } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

/**
 * @fileOverview Core service for managing wallet identities and balances via Firestore.
 */

export interface WalletIdentity {
  walletNumber: string;
  nexId: string;
  accountName: string;
  status: 'Active' | 'Suspended' | 'Restricted';
  verificationStatus: 'Verified' | 'Pending' | 'Tier 1' | 'Tier 2' | 'Tier 3';
  memberSince: string;
  tier: string;
}

export const getWalletIdentity = async (userId: string): Promise<WalletIdentity | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  const userData = userSnap.data();

  return {
    walletNumber: userId.slice(0, 10).toUpperCase(),
    nexId: userData.displayName || 'Member',
    accountName: userData.displayName || 'Nex Member',
    status: 'Active',
    verificationStatus: userData.isVerified ? 'Tier 3' : 'Tier 1',
    memberSince: userData.joinedAt?.toDate?.()?.toLocaleDateString() || 'Recently',
    tier: userData.tier || 'nex Basic'
  };
};

export const updateBalance = async (userId: string, amount: number) => {
  const walletRef = doc(db, 'wallets', userId);
  await updateDoc(walletRef, {
    available: increment(amount),
    lastUpdated: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

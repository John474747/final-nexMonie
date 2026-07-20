'use client';

import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

export const p2pService = {
  // ADS
  async createAd(data: any) {
    return addDoc(collection(db, 'p2p_ads'), {
      ...data,
      status: 'active',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // SEEDING
  async seedInitialMarketplace(userId: string, nickname: string) {
    const ads = [
      {
        merchantName: nickname,
        type: 'buy',
        asset: 'USDT',
        price: 1412.50,
        availableQuantity: 5000,
        minLimit: 10000,
        maxLimit: 1000000,
        paymentMethods: ['Bank Transfer', 'Moniepoint'],
        createdBy: userId,
        status: 'active'
      },
      {
        merchantName: nickname,
        type: 'sell',
        asset: 'USDT',
        price: 1425.00,
        availableQuantity: 12500,
        minLimit: 5000,
        maxLimit: 2500000,
        paymentMethods: ['Bank Transfer'],
        createdBy: userId,
        status: 'active'
      },
      {
        merchantName: nickname,
        type: 'buy',
        asset: 'BTC',
        price: 72500000,
        availableQuantity: 0.5,
        minLimit: 50000,
        maxLimit: 5000000,
        paymentMethods: ['Bank Transfer'],
        createdBy: userId,
        status: 'active'
      },
      {
        merchantName: nickname,
        type: 'sell',
        asset: 'BTC',
        price: 74200000,
        availableQuantity: 1.2,
        minLimit: 100000,
        maxLimit: 10000000,
        paymentMethods: ['Bank Transfer', 'Opay'],
        createdBy: userId,
        status: 'active'
      }
    ];

    const batch = writeBatch(db);
    ads.forEach(ad => {
      const adRef = doc(collection(db, 'p2p_ads'));
      batch.set(adRef, {
        ...ad,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  },

  // ORDERS
  async createOrder(data: any) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min expiry

    return addDoc(collection(db, 'p2p_orders'), {
      ...data,
      status: 'pending',
      isActive: true,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      referenceId: 'NEX-ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
  },

  async updateOrderStatus(orderId: string, status: string) {
    const orderRef = doc(db, 'p2p_orders', orderId);
    return updateDoc(orderRef, { 
      status, 
      updatedAt: serverTimestamp() 
    });
  },

  // CHAT
  async sendMessage(orderId: string, senderId: string, text: string, type: 'text' | 'image' | 'system' = 'text') {
    return addDoc(collection(db, 'p2p_orders', orderId, 'messages'), {
      orderId,
      senderId,
      text,
      type,
      createdAt: serverTimestamp(),
    });
  },

  // MERCHANT
  async getMerchantProfile(userId: string) {
    const q = query(collection(db, 'merchant_profiles'), where('userId', '==', userId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }
};

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { merchantId, action } = await request.json(); // action: 'approve' | 'suspend' | 'reject'

    if (!merchantId || !action) {
      return NextResponse.json({ success: false, error: 'Missing merchantId or action' }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Server configuration error. Set FIREBASE_SERVICE_ACCOUNT_JSON.' }, { status: 503 });
    }

    const merchantRef = db.collection('merchant_profiles').doc(merchantId);
    const merchantSnap = await merchantRef.get();

    if (!merchantSnap.exists) {
      return NextResponse.json({ success: false, error: 'Merchant profile not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      suspend: 'suspended',
      reject: 'rejected',
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await merchantRef.update({
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Also update user role if approved
    if (action === 'approve') {
      const userId = merchantSnap.data()!.userId;
      if (userId) {
        await db.collection('users').doc(userId).update({
          role: 'merchant',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ success: true, message: `Merchant ${newStatus}.` });
  } catch (err: any) {
    console.error('[merchants/approve]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

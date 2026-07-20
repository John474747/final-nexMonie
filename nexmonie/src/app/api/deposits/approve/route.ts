import { NextResponse } from 'next/server';

/**
 * NOTE: Deposit approval is now handled client-side directly via Firestore transactions
 * in the merchant dashboard and founder dashboard, secured by Firestore security rules.
 * This route is kept as a webhook entry point for future payment provider integrations.
 */
export async function POST(request: Request) {
  return NextResponse.json({ 
    success: false, 
    error: 'Use client-side Firestore transaction for deposit approval. See merchant dashboard.' 
  }, { status: 501 });
}

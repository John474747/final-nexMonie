
'use client';

/**
 * @fileOverview Service layer for managing deposit sessions and requests.
 * Prepares the frontend for future Supabase integration.
 */

export interface DepositSession {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiryTime: Date;
  status: 'active' | 'expired';
}

export interface DepositRequestInput {
  amount: number;
  senderBank: string;
  reference?: string;
  screenshot?: File | null;
}

/**
 * Fetches the currently active collection account and session details.
 */
export async function getDepositSession(): Promise<DepositSession> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const now = new Date();
  const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

  return {
    id: 'sess_' + Math.random().toString(36).substring(7),
    bankName: 'Moniepoint MFB',
    accountNumber: '5051528892',
    accountName: 'NEXMONIE SOLUTIONS LTD',
    expiryTime: fifteenMinutesLater,
    status: 'active',
  };
}

/**
 * Submits a deposit confirmation request to the backend.
 */
export async function submitDepositRequest(input: DepositRequestInput): Promise<{ success: boolean; referenceId: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log('Submitting deposit request to Supabase:', input);

  return {
    success: true,
    referenceId: 'DEP-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
}

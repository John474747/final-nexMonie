'use client';

import { Wallet, ActionStatus } from '@/types';

/**
 * @fileOverview Feature Service for Wallet Operations.
 * Prepared for Supabase Repository integration.
 */

export const WalletService = {
  /**
   * Retrieves the current user's primary wallet.
   */
  async getPrimaryWallet(userId: string): Promise<Wallet> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      id: 'wallet_001',
      userId,
      available: 1250450.50,
      savings: 450000.00,
      investments: 1813153.22,
      vault: 1000000.00,
      lastUpdated: new Date().toISOString(),
      currency: 'NGN'
    };
  },

  /**
   * Submits a transfer request.
   */
  async submitTransfer(payload: {
    recipientId: string;
    amount: number;
    narration?: string;
  }): Promise<{ referenceId: string }> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate probability of failure
    if (Math.random() < 0.05) {
      throw new Error('Transfer declined by clearing house.');
    }

    return {
      referenceId: 'NEX-' + Math.random().toString(36).substring(7).toUpperCase()
    };
  }
};

'use client';

import { Transaction } from '@/types';

/**
 * @fileOverview Feature Service for Transaction Ledger.
 */

export const TransactionService = {
  /**
   * Retrieves recent transactions for a user.
   */
  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    // Placeholder for Supabase:
    // const { data } = await supabase.from('transactions').select('*').eq('userId', userId).limit(limit);
    
    return [
      {
        id: 'tx_001',
        userId,
        walletId: 'wallet_001',
        title: 'Transfer to Sarah',
        amount: 5000,
        type: 'transfer',
        category: 'Transfer',
        timestamp: new Date().toISOString(),
        status: 'completed',
        referenceId: 'NEX-TR-12345',
        recipient: 'Sarah Nicholas'
      },
      {
        id: 'tx_002',
        userId,
        walletId: 'wallet_001',
        title: 'Airtime Top-up',
        amount: 2000,
        type: 'expense',
        category: 'Bills',
        timestamp: new Date().toISOString(),
        status: 'completed',
        referenceId: 'NEX-AIR-56789'
      }
    ];
  }
};

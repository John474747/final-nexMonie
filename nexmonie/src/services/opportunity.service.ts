'use client';

import { Opportunity } from '@/types';

/**
 * @fileOverview Feature Service for Web3 Opportunities (Earn).
 */

export const OpportunityService = {
  /**
   * Retrieves a list of opportunities.
   */
  async getOpportunities(filter?: string): Promise<Opportunity[]> {
    // Placeholder for Supabase integration:
    // let query = supabase.from('opportunities').select('*');
    
    return [
      {
        id: 'opp_001',
        title: 'Decentralized Identity Grant',
        company: 'Solana Foundation',
        category: 'Grant',
        price: 15000,
        daysLeft: 12,
        applicants: 82,
        tags: ['ZK', 'Rust', 'Identity'],
        difficulty: 'expert',
        isVerified: true,
        isFeatured: true
      },
      {
        id: 'opp_002',
        title: 'Technical Documentation',
        company: 'Superteam Nigeria',
        category: 'Bounty',
        price: 500,
        daysLeft: 5,
        applicants: 14,
        tags: ['Writing', 'API'],
        difficulty: 'intermediate',
        isVerified: true,
        isFeatured: false
      }
    ];
  }
};

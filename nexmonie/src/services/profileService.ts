'use client';

/**
 * @fileOverview Service for managing user profiles, tiers, and account limits.
 */

export interface AccountLimit {
  type: string;
  max: number;
  used: number;
  remaining: number;
}

export interface ProfileStats {
  tier: 'nex Basic' | 'nex Elite' | 'nex Premium';
  verificationLevel: number;
  dailyLimit: AccountLimit;
  monthlyLimit: AccountLimit;
}

export const getProfileStats = async (): Promise<ProfileStats> => {
  await new Promise(r => setTimeout(r, 600));
  return {
    tier: 'nex Elite',
    verificationLevel: 2,
    dailyLimit: {
      type: 'Daily',
      max: 500000,
      used: 125000,
      remaining: 375000
    },
    monthlyLimit: {
      type: 'Monthly',
      max: 5000000,
      used: 1850000,
      remaining: 3150000
    }
  };
};

export const getTierBenefits = (tier: string) => {
  const benefits = {
    'nex Basic': ['Max Balance: ₦300,000', 'Daily Transfer: ₦50,000', '3 Free Transfers/mo'],
    'nex Elite': ['Max Balance: ₦5,000,000', 'Daily Transfer: ₦500,000', 'Unlimited Free Transfers', 'Priority Support'],
    'nex Premium': ['Unlimited Balance', 'Daily Transfer: ₦5,000,000+', 'Bespoke Account Manager', 'Exclusive Event Access']
  };
  return benefits[tier as keyof typeof benefits] || benefits['nex Basic'];
};

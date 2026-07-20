/**
 * @fileOverview Standardized Type Definitions for nexMonie.
 * Aligned with backend.json blueprints and Bybit P2P standards.
 */

import { 
  TransactionStatus, 
  TransactionType, 
  VerificationStatus, 
  UserRole, 
  AccountStatus,
  P2PStatus,
  SavingsStatus,
  OpportunityStatus,
  NotificationType
} from '@/constants';

export type EntityId = string;

/**
 * Merchant Tier Definitions
 */
export type MerchantTierId = 'Beginner' | 'Regular' | 'Veteran' | 'Bronze' | 'Silver' | 'Gold' | 'BlockTrade';

export interface MerchantTier {
  id: MerchantTierId;
  label: string;
  badgeColor: string;
  securityDeposit: number; // in USDT
  maxAdLimit: number; // in USDT equivalent
  requirements: {
    minOrders?: number;
    minCompletionRate?: number;
    accountAgeDays?: number;
    volumeUsdt?: number;
  };
  permissions: string[];
}

/**
 * Standard Async States for Actions
 */
export type ActionStatus = 'idle' | 'loading' | 'success' | 'failed' | 'timeout' | 'cancelled';

export interface ActionState<T = any> {
  status: ActionStatus;
  data: T | null;
  error: string | null;
  timestamp?: string;
}

export interface UserProfile {
  id: EntityId;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  tier: 'nex Basic' | 'nex Elite' | 'nex Premium';
  isVerified: boolean;
  status: AccountStatus;
  joinedAt: string;
  preferredLanguage: string;
  kycLevel: number;
  role: UserRole;
}

export interface Wallet {
  id: EntityId;
  userId: EntityId;
  available: number;
  savings: number;
  investments: number;
  vault: number;
  lastUpdated: string;
  currency: string;
}

export interface Transaction {
  id: EntityId;
  userId: EntityId;
  walletId: EntityId;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  timestamp: string;
  status: TransactionStatus;
  referenceId: string;
  recipient?: string;
}

export interface P2PAdvertisement {
  id: EntityId;
  createdBy: EntityId;
  merchantName: string;
  merchantTier: MerchantTierId;
  type: 'buy' | 'sell';
  asset: string;
  price: number;
  availableQuantity: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  status: 'active' | 'paused' | 'closed';
  ordersCount: number;
  completionRate: number;
  createdAt: any;
}

export interface P2POrder {
  id: EntityId;
  adId: EntityId;
  buyerId: EntityId;
  sellerId: EntityId;
  asset: string;
  quantity: number;
  fiatAmount: number;
  price: number;
  status: 'pending' | 'unpaid' | 'paid' | 'released' | 'completed' | 'cancelled' | 'appealed';
  paymentMethod: string;
  referenceId: string;
  expiresAt: any;
  createdAt: any;
}

export interface MerchantProfile {
  id: EntityId;
  userId: EntityId;
  nickname: string;
  tier: MerchantTierId;
  status: 'pending' | 'approved' | 'suspended';
  totalTrades: number;
  completionRate: number;
  revenue: number;
  tradingVolume: number;
  isOnline: boolean;
  joinedAt: any;
}

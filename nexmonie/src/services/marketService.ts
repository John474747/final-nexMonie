'use client';

/**
 * @fileOverview Service for P2P marketplace, merchants, and market intelligence.
 * Prepared for Supabase integration.
 */

export interface Merchant {
  id: string;
  name: string;
  isVerified: boolean;
  isPreferred: boolean;
  level: number;
  orders: number;
  completion: number;
  releaseTime: string; // e.g., "15m"
  price: number;
  available: string; // e.g., "5,000 USDT"
  limitMin: number;
  limitMax: number;
  payments: string[];
  trustScore: number;
  status: 'online' | 'offline';
  avgResponse: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  imageUrl: string;
  category: string;
}

export const getP2PMerchants = async (asset: string = 'USDT'): Promise<Merchant[]> => {
  await new Promise(r => setTimeout(r, 600));
  return [
    {
      id: 'm1',
      name: 'Elhusary Elite',
      isVerified: true,
      isPreferred: true,
      level: 4,
      orders: 4250,
      completion: 99.8,
      releaseTime: '2m',
      price: asset === 'USDT' ? 1412.50 : 1380.20,
      available: `5,264 ${asset}`,
      limitMin: 100000,
      limitMax: 5000000,
      payments: ['Bank Transfer', 'Moniepoint'],
      trustScore: 98,
      status: 'online',
      avgResponse: '1m'
    },
    {
      id: 'm2',
      name: 'ROBOT-PAY',
      isVerified: true,
      isPreferred: false,
      level: 3,
      orders: 15892,
      completion: 100,
      releaseTime: '5m',
      price: asset === 'USDT' ? 1415.00 : 1385.50,
      available: `13,792 ${asset}`,
      limitMin: 10000,
      limitMax: 500000,
      payments: ['Bank Transfer', 'Opay'],
      trustScore: 99,
      status: 'online',
      avgResponse: '2m'
    },
    {
      id: 'm3',
      name: 'CryptoKing_NG',
      isVerified: false,
      isPreferred: false,
      level: 1,
      orders: 890,
      completion: 96.5,
      releaseTime: '12m',
      price: asset === 'USDT' ? 1410.25 : 1375.00,
      available: `2,100 ${asset}`,
      limitMin: 5000,
      limitMax: 250000,
      payments: ['Bank Transfer', 'PalmPay'],
      trustScore: 94,
      status: 'offline',
      avgResponse: '15m'
    },
    {
      id: 'm4',
      name: 'Elite_Trader_Lagos',
      isVerified: true,
      isPreferred: true,
      level: 5,
      orders: 24500,
      completion: 99.9,
      releaseTime: '1m',
      price: asset === 'USDT' ? 1413.00 : 1382.00,
      available: `25,000 ${asset}`,
      limitMin: 500000,
      limitMax: 15000000,
      payments: ['Bank Transfer', 'Kuda'],
      trustScore: 100,
      status: 'online',
      avgResponse: '30s'
    },
    {
      id: 'm5',
      name: 'FastLiquidity',
      isVerified: true,
      isPreferred: false,
      level: 2,
      orders: 1200,
      completion: 98.2,
      releaseTime: '8m',
      price: asset === 'USDT' ? 1414.50 : 1381.50,
      available: `1,500 ${asset}`,
      limitMin: 1000,
      limitMax: 100000,
      payments: ['Bank Transfer'],
      trustScore: 95,
      status: 'online',
      avgResponse: '3m'
    }
  ];
};

export const getMarketNews = async (): Promise<NewsArticle[]> => {
  return [
    {
      id: 'n1',
      title: 'Nigeria’s Inflation Rate Eases to 28% in January',
      source: 'NEX Business',
      time: '2h ago',
      imageUrl: 'https://picsum.photos/seed/n1/200/150',
      category: 'Economy'
    },
    {
      id: 'n2',
      title: 'Bitcoin Hits All-Time High Against Naira',
      source: 'CryptoPulse',
      time: '4h ago',
      imageUrl: 'https://picsum.photos/seed/n2/200/150',
      category: 'Crypto'
    }
  ];
};

export const getDiscoverContent = () => {
  return {
    trending: ['USDT/NGN', 'BTC', 'MTN Nigeria', 'Gold', 'Tesla', 'ETH'],
    articles: [
      { id: 'a1', title: 'Beginner’s Guide to ETF Investing', type: 'Educational' },
      { id: 'a2', title: 'Risk Management for Crypto Traders', type: 'Security' },
      { id: 'a3', title: 'Understanding Dividends in Nigeria', type: 'Guide' }
    ]
  };
};

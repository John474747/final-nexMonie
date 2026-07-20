'use client';

/**
 * @fileOverview Service for Stocks, ETFs, Forex, and Commodities market data.
 */

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'Stock' | 'Crypto' | 'ETF' | 'Forex' | 'Commodity';
  marketCap?: string;
  volume?: string;
  description?: string;
  high52w?: number;
  low52w?: number;
}

export const getStocks = async (): Promise<Asset[]> => {
  return [
    { symbol: 'MTNN', name: 'MTN Nigeria', price: 275.50, change: 5.20, changePercent: 1.92, type: 'Stock', marketCap: '₦5.6T', volume: '12M', description: 'MTN Nigeria is the largest telecommunications provider in Nigeria.' },
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 450.00, change: -2.50, changePercent: -0.55, type: 'Stock', marketCap: '₦7.2T', volume: '2M' },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 38.45, change: 1.15, changePercent: 3.08, type: 'Stock', marketCap: '₦1.2T', volume: '45M' },
    { symbol: 'GTCO', name: 'GT Holdings', price: 42.10, change: 0.85, changePercent: 2.06, type: 'Stock', marketCap: '₦1.1T', volume: '38M' },
    { symbol: 'AIRTELAFRI', name: 'Airtel Africa', price: 2200.00, change: 45.00, changePercent: 2.09, type: 'Stock', marketCap: '₦8.1T', volume: '1.5M' },
  ];
};

export const getETFs = async (): Promise<Asset[]> => {
  return [
    { symbol: 'VOO', name: 'Vanguard S&P 500', price: 460.22, change: 4.15, changePercent: 0.91, type: 'ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 435.10, change: 6.80, changePercent: 1.58, type: 'ETF' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market', price: 252.34, change: 2.10, changePercent: 0.84, type: 'ETF' },
  ];
};

export const getForex = async (): Promise<Asset[]> => {
  return [
    { symbol: 'USD/NGN', name: 'US Dollar / Naira', price: 1412.50, change: 12.00, changePercent: 0.86, type: 'Forex' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2642, change: -0.0012, changePercent: -0.09, type: 'Forex' },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0825, change: 0.0004, changePercent: 0.04, type: 'Forex' },
  ];
};

export const getCommodities = async (): Promise<Asset[]> => {
  return [
    { symbol: 'GOLD', name: 'Gold', price: 2024.50, change: 15.20, changePercent: 0.76, type: 'Commodity' },
    { symbol: 'SILVER', name: 'Silver', price: 22.84, change: 0.45, changePercent: 2.01, type: 'Commodity' },
    { symbol: 'CRUDE', name: 'Crude Oil (WTI)', price: 77.42, change: -1.12, changePercent: -1.42, type: 'Commodity' },
  ];
};

export const getCryptoAssets = async (): Promise<Asset[]> => {
  return [
    { symbol: 'BTC', name: 'Bitcoin', price: 51240.22, change: 1240.00, changePercent: 2.48, type: 'Crypto' },
    { symbol: 'ETH', name: 'Ethereum', price: 2942.15, change: 85.10, changePercent: 2.97, type: 'Crypto' },
    { symbol: 'SOL', name: 'Solana', price: 108.45, change: 4.20, changePercent: 4.03, type: 'Crypto' },
    { symbol: 'BNB', name: 'BNB', price: 355.20, change: 2.45, changePercent: 0.69, type: 'Crypto' },
  ];
};

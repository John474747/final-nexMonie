'use client';

/**
 * @fileOverview Local simulated watchlist service.
 */

import { type Asset } from './investmentService';

const WATCHLIST_KEY = 'nexmonie_watchlist';

export const getWatchlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : ['BTC', 'MTNN', 'GOLD'];
};

export const toggleWatchlist = (symbol: string) => {
  const current = getWatchlist();
  const index = current.indexOf(symbol);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(symbol);
  }
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(current));
};

export const isWatched = (symbol: string): boolean => {
  return getWatchlist().includes(symbol);
};

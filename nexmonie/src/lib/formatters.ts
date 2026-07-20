/**
 * @fileOverview Reusable formatting utilities for nexMonie.
 * Ensures consistent data presentation throughout the application.
 */

import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency === 'NGN' ? 'NGN' : 'USD',
    minimumFractionDigits: 2,
  });

  // Replace NGN symbol with ₦ for branding consistency
  return formatter.format(amount).replace('NGN', '₦');
};

export const formatDate = (date: string | Date, pattern: string = 'MMM d, yyyy'): string => {
  return format(new Date(date), pattern);
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Simple masking for privacy
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const maskAccountNumber = (acc: string): string => {
  if (acc.length < 4) return acc;
  return `****${acc.slice(-4)}`;
};

export const formatWalletId = (id: string): string => {
  return id.toUpperCase().slice(0, 8);
};

export const formatReference = (ref: string): string => {
  return ref.toUpperCase();
};

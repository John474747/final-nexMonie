"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { CommandCenter } from '@/components/dashboard/CommandCenter'
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid'
import { ProductDiscovery } from '@/components/dashboard/ProductDiscovery'
import { NexTipsBanner } from '@/components/dashboard/NexTipsBanner'
import { BottomNav } from '@/components/layout/BottomNav'
import MarketsFeed from "@/components/MarketsFeed"
import { NexLogo } from '@/components/ui/NexLogo'
import { Bell, User, Loader2 } from 'lucide-react'
import { useUser, useDoc } from '@/firebase'
import { Wallet, UserProfile } from '@/types'

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const { data: wallet, loading: walletLoading } = useDoc<Wallet>(user ? { table: 'wallets', id: user.uid } : null);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(user ? { table: 'users', id: user.uid } : null);

  const loading = authLoading || walletLoading || profileLoading;

  return (
    <main className="min-h-screen pb-32 sm:pb-36 bg-background overflow-x-hidden">
      <header className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-b border-gray-50">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <NexLogo className="scale-90 sm:scale-100 origin-left" />
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => router.push('/profile')}
              className="relative cursor-pointer p-1.5 active:scale-95 transition-transform"
            >
              <Bell size={22} className="text-foreground sm:w-6 sm:h-6" />
              <div className="absolute top-1 right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[6px] sm:text-[7px] font-bold text-white">3</span>
              </div>
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-nex-xs bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm active:scale-95 transition-transform"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-gray-300" />
              ) : profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between px-1">
          <div className="max-w-[80%]">
            <h1 className="text-[18px] sm:text-nex-h1 text-foreground font-bold leading-tight truncate">
              {loading ? (
                <span className="opacity-50">Syncing...</span>
              ) : (
                <>Welcome, {profile?.displayName?.split(' ')[0] || 'Elite'}! 👋</>
              )}
            </h1>
            <p className="text-[12px] sm:text-nex-sub text-gray-500 font-medium truncate">
              Your financial command center.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 sm:space-y-8 pt-4 sm:pt-6">
        <CommandCenter wallet={wallet || null} loading={loading} />
        <QuickActionGrid />
        <ProductDiscovery />
        <NexTipsBanner />
        <MarketsFeed />
      </div>

      <BottomNav />
    </main>
  )
}

"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Plus, Send, Landmark, CreditCard, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet } from '@/types'

interface CommandCenterProps {
  wallet: Wallet | null;
  loading: boolean;
}

export function CommandCenter({ wallet, loading }: CommandCenterProps) {
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)

  const displayBalance = wallet?.available || 0

  return (
    <div className="px-4 sm:px-6 mb-4 sm:mb-8">
      <Card className="bg-gradient-to-br from-[#005F56] to-[#0D9B85] relative border-none text-white overflow-hidden rounded-[24px] sm:rounded-[32px] shadow-xl pt-4 sm:pt-6 pb-4 sm:pb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="px-4 sm:px-6 relative z-10">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.15em] opacity-80">Available Portfolio</span>
            <button 
              onClick={() => setShowBalance(!showBalance)} 
              className="text-white/80 hover:text-white transition-colors p-1 active:scale-90"
            >
              {showBalance ? <Eye size={14} className="sm:w-4 sm:h-4" /> : <EyeOff size={14} className="sm:w-4 sm:h-4" />}
            </button>
          </div>
          
          <div className="flex items-baseline gap-0.5 sm:gap-1 mb-2 sm:mb-4 overflow-hidden">
            <span className="text-[18px] sm:text-[28px] font-bold leading-none">₦</span>
            {loading ? (
              <Skeleton className="h-8 w-32 bg-white/10" />
            ) : (
              <span className={`text-[22px] sm:text-[32px] font-bold leading-none transition-all duration-300 truncate ${!showBalance && "blur-lg"}`}>
                {showBalance ? Number(displayBalance).toLocaleString() : "•••••••"}
              </span>
            )}
            {showBalance && !loading && <span className="text-[13px] sm:text-[20px] font-bold align-super ml-0.5 opacity-90">.00</span>}
          </div>

          <button 
            onClick={() => router.push('/finances')} 
            className="inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] sm:text-[11px] font-bold text-white mb-4 sm:mb-6 hover:bg-white/20 transition-all active:scale-95"
          >
            Portfolio Breakdown <ChevronRight size={10} className="sm:w-3 sm:h-3" />
          </button>
        </div>

        <div className="h-[1px] w-full bg-white/10 mb-3 sm:mb-4" />

        <div className="flex items-start justify-between px-2 sm:px-6 relative z-10">
          <ActionItem id="fund" onClick={() => router.push('/fund-account')} icon={<Plus size={16} />} label="Fund" />
          <ActionItem id="send" onClick={() => router.push('/send-money')} icon={<Send size={16} />} label="Send" />
          <ActionItem id="save" onClick={() => router.push('/save')} icon={<Landmark size={16} />} label="Save" />
          <ActionItem id="details" onClick={() => router.push('/wallet-details')} icon={<CreditCard size={16} />} label="Details" />
        </div>
      </Card>
    </div>
  )
}

function ActionItem({ id, icon, label, onClick }: { id: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button key={id} onClick={onClick} className="flex flex-col items-center gap-1 sm:gap-2 transition-all active:scale-90 flex-1 group">
      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
        {React.cloneElement(icon as React.ReactElement, { 
          className: "w-3.5 h-3.5 sm:w-5 sm:h-5" 
        })}
      </div>
      <span className="text-[7px] sm:text-[10px] font-bold opacity-80 text-center leading-tight uppercase tracking-wider">
        {label}
      </span>
    </button>
  )
}

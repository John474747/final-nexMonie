"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Search, 
  TrendingUp,
  User,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Briefcase
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'

export default function FinancesScreen() {
  const router = useRouter()
  
  return (
    <main className="min-h-screen pb-40 bg-[#F8FAF9]">
      <header className="px-6 pt-10 pb-6 bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-bold text-slate-900">Finance</h1>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={20} className="text-gray-500" />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search investors, stocks, themes..." 
            className="pl-11 h-12 rounded-2xl bg-gray-100 border-none text-[14px]" 
          />
        </div>
      </header>

      <div className="px-6 py-6 space-y-10">
        <section>
          <h2 className="text-[18px] font-bold text-slate-900 mb-4">Featured Collection</h2>
          <Card className="h-48 bg-[#008D83] text-white p-6 rounded-[32px] border-none flex flex-col justify-end shadow-xl">
             <h3 className="text-2xl font-bold mb-1">AI Revolution</h3>
             <p className="text-teal-100">Invest in the future of intelligence.</p>
          </Card>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-[18px] font-bold text-slate-900">People You Can Copy</h2>
             <button className="text-[13px] font-bold text-[#008D83]">View All</button>
          </div>
          <div className="space-y-4">
            <InvestorCard name="Warren Buffett" title="Hedge Fund Manager" return="22%" risk="Low" />
            <InvestorCard name="Michael Burry" title="Hedge Fund Manager" return="18%" risk="Medium" />
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-[18px] font-bold text-slate-900">Trending Strategies</h2>
             <button className="text-[13px] font-bold text-[#008D83]">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StrategyCard title="AI Revolution" />
            <StrategyCard title="Dividend Kings" />
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-slate-900 mb-4">Explore</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2">
               {['Stocks', 'ETFs', 'AI', 'Crypto', 'Energy', 'Healthcare'].map(chip => (
                 <button key={chip} className="px-5 py-2.5 bg-white rounded-full text-[13px] font-bold text-slate-700 shadow-sm border border-gray-100">{chip}</button>
               ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-slate-900 mb-4">Trending Today</h2>
          <Card className="p-4 rounded-[24px] border-none shadow-sm space-y-3">
             <TrendingRow title="New Follower" value="Sarah J." />
             <TrendingRow title="Copy Count" value="1,200+" />
          </Card>
        </section>
        
        <section>
          <h2 className="text-[18px] font-bold text-slate-900 mb-4">Market Pulse</h2>
          <div className="grid grid-cols-2 gap-4">
            <MarketCard title="S&P 500" value="5,500.00" change="+1.2%" />
            <MarketCard title="Bitcoin" value="$65,000" change="-0.5%" />
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}

function InvestorCard({ name, title, return: returnVal, risk }: any) {
  return (
    <Card className="p-4 rounded-[24px] border-none shadow-sm flex items-center gap-4">
       <div className="w-12 h-12 rounded-full bg-gray-200" />
       <div className="flex-1">
          <h4 className="font-bold text-slate-900">{name}</h4>
          <p className="text-[12px] text-gray-500">{title}</p>
       </div>
       <div className="text-right">
          <p className="font-bold text-[#008D83]">+{returnVal}</p>
          <p className="text-[10px] text-gray-400 uppercase">{risk} Risk</p>
       </div>
       <button className="px-4 py-2 bg-[#FF8882] text-white rounded-xl text-[12px] font-bold">Copy</button>
    </Card>
  )
}

function StrategyCard({ title }: any) {
  return (
    <Card className="p-4 rounded-[24px] border-none shadow-sm h-32 flex flex-col justify-end bg-white">
      <h4 className="font-bold text-slate-900">{title}</h4>
    </Card>
  )
}

function TrendingRow({ title, value }: any) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-[13px] text-gray-500">{title}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  )
}

function MarketCard({ title, value, change }: any) {
  return (
    <Card className="p-4 rounded-[24px] border-none shadow-sm">
      <p className="text-[12px] text-gray-500 mb-1">{title}</p>
      <p className="font-bold text-slate-900">{value}</p>
      <p className={cn("text-[12px] font-bold", change.startsWith('+') ? "text-[#008D83]" : "text-[#FF8882]")}>{change}</p>
    </Card>
  )
}

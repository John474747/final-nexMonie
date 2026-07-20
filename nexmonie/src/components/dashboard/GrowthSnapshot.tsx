
"use client"

import React from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function GrowthSnapshot() {
  return (
    <div className="px-4 mb-12">
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-[17px] font-bold text-[#1A1A1A] tracking-tight">Your Growth Snapshot</h2>
        <button className="text-[14px] font-bold text-primary flex items-center gap-1.5 active:opacity-60 transition-opacity">
          This month <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-md">↓</span>
        </button>
      </div>
      
      <div className="flex gap-4">
        <GrowthCard 
          icon={<TrendingUp size={14} />} 
          label="Total Inflow" 
          amount="₦125.6k" 
          percentage="+12.5%" 
          isPositive={true}
          iconBg="bg-[#E8F5F3]"
          iconColor="text-emerald-500"
        />
        <GrowthCard 
          icon={<TrendingDown size={14} />} 
          label="Total Outflow" 
          amount="₦78.4k" 
          percentage="-5.3%" 
          isPositive={false}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <GrowthCard 
          icon={<BarChart3 size={14} />} 
          label="Net Growth" 
          amount="₦47.2k" 
          percentage="+18.2%" 
          isPositive={true}
          iconBg="bg-[#E8F5F3]"
          iconColor="text-emerald-500"
        />
      </div>
    </div>
  )
}

function GrowthCard({ icon, label, amount, percentage, isPositive, iconBg, iconColor }: any) {
  return (
    <Card className="flex-1 bg-white p-4 border-none shadow-soft rounded-[24px] flex flex-col items-start gap-1">
      <div className={`${iconBg} ${iconColor} w-7 h-7 rounded-[10px] flex items-center justify-center mb-1`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-[15px] font-bold text-[#1A1A1A] leading-tight">{amount}</p>
      <div className={`text-[11px] font-bold mt-1 px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
        {percentage}
      </div>
    </Card>
  )
}

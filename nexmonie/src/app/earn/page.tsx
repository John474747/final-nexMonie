"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search, 
  Clock, 
  User,
  ShieldCheck,
  X,
  Bookmark,
  Target,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Share2,
  Zap,
  Layers,
  Code,
  Palette,
  PenTool,
  Cpu,
  Landmark,
  Mail,
  Link2,
  Globe
} from 'lucide-react'
import { useUser } from '@/firebase'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Skeleton } from '@/components/ui/skeleton'
import { type Opportunity, getMockOpportunities } from '@/services/opportunityService'

const CATEGORIES = [
  { id: 'all', label: 'All Discovery', icon: <Layers size={14} /> },
  { id: 'Job', label: 'Jobs', icon: <Zap size={14} /> },
  { id: 'Bounty', label: 'Bounties', icon: <Target size={14} /> },
  { id: 'Hackathon', label: 'Hackathons', icon: <Code size={14} /> },
  { id: 'Grant', label: 'Grants', icon: <Landmark size={14} /> },
]

const CAREER_READINESS_ITEMS = [
  { id: 'email', label: 'Verified Email', icon: <Mail size={16} />, action: 'Verify', isComplete: true },
  { id: 'profile', label: 'Talent Profile', icon: <User size={16} />, action: 'Complete', isComplete: false },
  { id: 'wallet', label: 'Web3 Wallet', icon: <Link2 size={16} />, action: 'Connect', isComplete: false },
]

export default function EarnScreen() {
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getMockOpportunities()
      setOpportunities(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, selectedCategory])

  const featuredOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.isFeatured).slice(0, 3)
  }, [opportunities])

  return (
    <main className="min-h-screen pb-32 bg-background">
      <header className="px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-white sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <NexLogo className="scale-90 sm:scale-100 origin-left" />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative cursor-pointer p-1">
              <Bell size={22} className="text-foreground sm:w-6 sm:h-6" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">5</span>
              </div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-nex-xs bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
              <User size={20} className="text-gray-300" />
            </div>
          </div>
        </div>
        <h1 className="text-[22px] sm:text-nex-h1 font-bold text-foreground leading-tight">Discover & Earn</h1>
      </header>

      <section className="px-6 mt-6 mb-8">
        <Card className="p-6 rounded-nex-2xl bg-white border border-gray-100 shadow-nex-soft overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-foreground mb-0.5">Elite Readiness</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Complete profile to unlock opportunities</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-[10px]">60%</div>
          </div>
          <div className="space-y-3">
            {CAREER_READINESS_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-nex-sm bg-gray-50/50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-nex-xs flex items-center justify-center shadow-sm", item.isComplete ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent")}>
                    {item.icon}
                  </div>
                  <h4 className="text-[13px] font-bold text-foreground">{item.label}</h4>
                </div>
                {item.isComplete ? <CheckCircle2 size={16} className="text-emerald-500" /> : <button className="text-[9px] font-bold text-accent uppercase tracking-widest">{item.action}</button>}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {!loading && (
        <section className="mb-10">
          <div className="px-6 flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-foreground">Featured Ecosystem</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 px-6 pb-4">
              {featuredOpportunities.map(opp => (
                <Card 
                  key={opp.id} 
                  onClick={() => setSelectedOpportunity(opp)}
                  className="w-[280px] p-6 rounded-nex-md bg-gradient-to-br from-[#1A1A1A] to-[#333333] border-none text-white shrink-0 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-nex-xs bg-white/10 flex items-center justify-center font-black italic text-xl">
                      {opp.organizationName.charAt(0).toLowerCase()}
                    </div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{opp.organizationName}</p>
                  </div>
                  <h3 className="text-[16px] font-bold mb-4 whitespace-normal line-clamp-2 min-h-[48px]">{opp.title}</h3>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-emerald-400 font-black text-lg italic">
                      {opp.rewardCurrency === 'NGN' ? '₦' : '$'}{opp.rewardAmount.toLocaleString()}
                    </div>
                    <ChevronRight size={18} />
                  </div>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </section>
      )}

      <section className="px-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search opportunities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-nex-md bg-white border-none shadow-nex-soft" 
          />
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold transition-all border",
                  selectedCategory === cat.id ? "bg-[#1A1A1A] text-white" : "bg-white text-gray-500"
                )}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </section>

      <section className="px-6 pb-20">
        <div className="space-y-4">
          {loading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-nex-md" />)
          ) : filteredOpportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} onClick={() => setSelectedOpportunity(opp)} />
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  )
}

function OpportunityCard({ opportunity, onClick }: { opportunity: Opportunity; onClick: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className="p-5 border border-gray-100 shadow-nex-soft rounded-nex-md bg-white flex flex-col gap-4 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-nex-xs flex items-center justify-center text-white font-black italic", opportunity.category === 'Grant' ? "bg-primary" : "bg-accent")}>
          {opportunity.organizationName.charAt(0).toLowerCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{opportunity.organizationName}</span>
            {opportunity.isVerified && <ShieldCheck size={12} className="text-blue-500" fill="currentColor" />}
          </div>
          <h4 className="text-[15px] font-bold text-foreground leading-snug">{opportunity.title}</h4>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="text-emerald-500 font-black text-[13px] italic">₦{opportunity.rewardAmount.toLocaleString()}</div>
        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{opportunity.category}</Badge>
      </div>
    </Card>
  )
}
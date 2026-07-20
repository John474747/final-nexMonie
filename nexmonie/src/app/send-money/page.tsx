"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Search, 
  User, 
  CheckCircle2, 
  Loader2, 
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { useUser, useDoc, db } from '@/firebase'
import { useToast } from '@/hooks/use-toast'

export default function SendMoneyWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<'details' | 'review' | 'success' | 'failure'>('details')
  const [loading, setLoading] = useState(false)
  const [transferType, setTransferType] = useState('nex')
  const [searchQuery, setSearchQuery] = useState('')
  const [recipient, setRecipient] = useState<any>(null)
  const [amount, setAmount] = useState('')

  const { data: wallet } = useDoc<any>(user ? { table: 'wallets', id: user.uid } : null)

  const handleTransfer = async () => {
    if (!user || !wallet || !recipient) return
    const numericAmount = Number(amount)

    if ((wallet.available || 0) < numericAmount) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: 'Wallet balance too low.' })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 2000))
      setStage('success')
    } catch (e) {
      setStage('failure')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'details') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] border border-gray-100"><ChevronLeft size={22} /></button>
            <NexLogo />
            <div className="w-10" />
          </div>
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">Send Money</h1>
        </header>

        <div className="px-6 py-8">
          <Tabs defaultValue="nex" onValueChange={setTransferType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-2xl h-14 bg-gray-100 p-1">
              <TabsTrigger value="nex" className="rounded-xl font-bold">nexMonie User</TabsTrigger>
              <TabsTrigger value="bank" className="rounded-xl font-bold">Bank Account</TabsTrigger>
            </TabsList>

            <TabsContent value="nex" className="space-y-6">
              <section>
                <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Recipient</h2>
                <Card className="p-6 border-none shadow-soft rounded-[28px] bg-white">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input placeholder="Search Username or ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-14 pl-12 rounded-2xl bg-gray-50 border-none" />
                  </div>
                </Card>
              </section>
            </TabsContent>
          </Tabs>

          <section className="mt-8 mb-10">
            <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Amount</h2>
            <Card className="p-6 border-none shadow-soft rounded-[28px] bg-white space-y-6">
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1A1A1A]">₦</span>
                <Input placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} className="h-14 pl-8 rounded-2xl bg-gray-50 border-none font-bold text-[18px]" />
              </div>
            </Card>
          </section>

          <button onClick={() => setStage('review')} className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20">Continue</button>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'review') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between"><button onClick={() => setStage('details')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] border border-gray-100"><ChevronLeft size={22} /></button><h1 className="text-[18px] font-bold text-[#1A1A1A]">Confirm Transfer</h1></div>
        </header>
        <div className="px-6 py-10 text-center">
          <h2 className="text-[32px] font-bold text-[#1A1A1A] mb-10">₦{Number(amount).toLocaleString()}</h2>
          <button onClick={handleTransfer} className="w-full py-5 bg-primary text-white font-bold rounded-[22px]" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Transfer'}
          </button>
        </div>
      </main>
    )
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen flex flex-col bg-white items-center justify-center p-8 text-center">
        <CheckCircle2 size={56} className="text-primary mb-8" />
        <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Transfer Successful!</h1>
        <button onClick={() => router.push('/')} className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-[20px]">Return Dashboard</button>
      </main>
    )
  }

  return null
}
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wifi, CheckCircle2, Loader2, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc, db } from '@/firebase'
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile']
type DataPlan = { id: string; title: string; validity: string; price: number }

export default function BuyDataWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [stage, setStage] = useState<'input' | 'confirm' | 'success'>('input')
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0])
  const [plans, setPlans] = useState<DataPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)

  const { data: wallet } = useDoc<any>(user ? { table: 'wallets', id: user.uid } : null)

  useEffect(() => {
    fetch(`/api/data/plans?network=${selectedNetwork}`).then(r => r.json()).then(setPlans).catch(() => {})
  }, [selectedNetwork])

  const handleBuyClick = (plan: DataPlan) => {
    if (!phoneNumber || phoneNumber.length < 10) { toast({ variant: 'destructive', title: 'Invalid Number', description: 'Enter a valid 11-digit number.' }); return }
    setSelectedPlan(plan); setStage('confirm')
  }

  const handlePurchase = async () => {
    if (!user || !selectedPlan || !db) return
    if ((wallet?.available || 0) < selectedPlan.price) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Top up your wallet first.' }); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/data/purchase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, network: selectedNetwork, planId: selectedPlan.id, amount: selectedPlan.price })
      })
      const result = await res.json()
      if (result.success) {
        await runTransaction(db, async (txn) => {
          const walletRef = doc(db, 'wallets', user.uid)
          const snap = await txn.get(walletRef)
          const current = snap.data()?.available || 0
          if (current < selectedPlan.price) throw new Error('Insufficient funds')
          txn.update(walletRef, { available: current - selectedPlan.price, lastUpdated: serverTimestamp() })
        })
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid, title: `${selectedPlan.title} – ${selectedNetwork}`,
          amount: selectedPlan.price, type: 'expense', category: 'Data Bundle',
          status: 'completed', referenceId: result.transactionId, recipient: phoneNumber,
          createdAt: serverTimestamp()
        })
        setStage('success')
      } else {
        toast({ variant: 'destructive', title: 'Purchase Failed', description: result.error || 'Could not complete.' })
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Purchase failed.' })
    } finally { setLoading(false) }
  }

  if (stage === 'confirm' && selectedPlan) {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => setStage('input')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><ChevronLeft size={22} /></button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Confirm Purchase</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="px-6 py-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-4"><Wifi size={36} /></div>
            <div className="text-[32px] font-bold text-[#1A1A1A] mb-1">₦{selectedPlan.price.toLocaleString()}</div>
            <p className="text-[13px] text-gray-500">{selectedPlan.title} · {selectedNetwork}</p>
          </div>
          <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white mb-8 space-y-5">
            <div className="flex justify-between"><span className="text-gray-400">Recipient</span><span className="font-bold">{phoneNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-bold">{selectedPlan.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Validity</span><span className="font-bold">{selectedPlan.validity}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Balance</span><span className="font-bold">₦{(wallet?.available || 0).toLocaleString()}</span></div>
          </Card>
          <button disabled={loading} onClick={handlePurchase} className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <>Buy Data <CheckCircle2 size={18} /></>}
          </button>
        </div>
      </main>
    )
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen flex flex-col bg-white items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl mb-8"><CheckCircle2 size={56} /></div>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Purchase Successful!</h1>
        <p className="text-[15px] text-gray-500 mb-12">{selectedPlan?.title} sent to {phoneNumber}.</p>
        <button onClick={() => router.push('/')} className="w-full py-5 bg-[#1A1A1A] text-white font-bold rounded-[22px]">Return to Dashboard</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><ChevronLeft size={22} /></button>
          <NexLogo />
          <div className="w-10" />
        </div>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">Buy Data</h1>
        <p className="text-[13px] text-gray-400 mt-1">Balance: <span className="font-bold text-[#1A1A1A]">₦{(wallet?.available || 0).toLocaleString()}</span></p>
      </header>
      <div className="px-6 py-8 space-y-8">
        <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
            <Input type="tel" placeholder="08012345678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network</label>
            <div className="flex gap-2">
              {NETWORKS.map(n => (
                <button key={n} onClick={() => setSelectedNetwork(n)}
                  className={cn('flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all', selectedNetwork === n ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-100')}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          <p className="text-[13px] font-bold text-[#1A1A1A]">Select Plan</p>
          {plans.map(plan => (
            <Card key={plan.id} className="p-5 border-none shadow-soft rounded-[24px] bg-white flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#1A1A1A]">{plan.title}</p>
                <p className="text-[11px] text-gray-400">{plan.validity}</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-black text-primary">₦{plan.price.toLocaleString()}</p>
                <button onClick={() => handleBuyClick(plan)} className="mt-1 px-4 py-1.5 bg-primary text-white text-[11px] font-bold rounded-xl">Buy</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  )
}

"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  QrCode, 
  Camera, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Building2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc, db } from '@/firebase'
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

type Stage = 'scan' | 'review' | 'success' | 'failure'

export default function ScanPayWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<Stage>('scan')
  const [loading, setLoading] = useState(false)
  const [decoding, setDecoding] = useState(false)

  const [merchant, setMerchant] = useState<any>(null)
  const [amount, setAmount] = useState('')

  const { data: wallet } = useDoc<any>(user ? { table: 'wallets', id: user.uid } : null)

  const handleSimulateScan = async (type: 'static' | 'dynamic') => {
    setDecoding(true)
    try {
      const qrData = type === 'static' ? 'MERC-STATIC' : 'MERC-001'
      const res = await fetch('/api/scan/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData })
      })
      const data = await res.json()
      if (data.success) {
        setMerchant(data)
        setAmount(data.amount ? data.amount.toString() : '')
        setStage('review')
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Scan Error', description: 'Failed to decode QR code' })
    } finally {
      setDecoding(false)
    }
  }

  const handlePayment = async () => {
    if (!user || !wallet || !merchant) return
    const numericAmount = Number(amount)

    if (wallet.available_balance < numericAmount) {
      toast({ variant: 'destructive', title: "Insufficient Funds", description: "Your wallet balance is too low." })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/scan/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.merchantId, amount: numericAmount, userId: user.uid })
      })

      const result = await res.json()

      if (result.success) {
        await runTransaction(db!, async (txn) => {
          const walletRef = doc(db!, 'wallets', user.uid)
          const snap = await txn.get(walletRef)
          const current = snap.data()?.available || 0
          if (current < numericAmount) throw new Error('Insufficient funds')
          txn.update(walletRef, { available: current - numericAmount, lastUpdated: serverTimestamp() })
        })
        await addDoc(collection(db!, 'transactions'), {
          userId: user.uid,
          title: `QR Payment – ${merchant.merchantName}`,
          amount: numericAmount,
          type: 'expense',
          category: 'Scan & Pay',
          status: 'completed',
          referenceId: result.transactionId,
          recipient: merchant.merchantName,
          createdAt: serverTimestamp(),
        })
        setStage('success')
      } else {
        setStage('failure')
      }
    } catch (e) {
      setStage('failure')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'scan') {
    return (
      <main className="min-h-screen bg-black text-white relative">
        <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><ChevronLeft size={22} /></button>
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20"><QrCode size={14} className="text-accent" /><span className="text-[11px] font-bold uppercase tracking-widest">Scan Merchant QR</span></div>
        </header>

        <div className="flex-1 h-screen flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[#121212] flex items-center justify-center"><Camera size={120} className="text-white/5 animate-pulse" /></div>
           <div className="relative w-72 h-72 border-4 border-accent rounded-3xl" />
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-20 px-8 flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSimulateScan('dynamic')} className="py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-[22px] font-bold text-[14px]">Dynamic QR</button>
              <button onClick={() => handleSimulateScan('static')} className="py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-[22px] font-bold text-[14px]">Static QR</button>
           </div>
        </div>
      </main>
    )
  }

  if (stage === 'review') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setStage('scan')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] border border-gray-100"><ChevronLeft size={22} /></button>
            <NexLogo />
            <div className="w-10" />
          </div>
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">Confirm Payment</h1>
        </header>

        <div className="px-6 py-8">
           <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-4"><Building2 size={32} /></div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-1">{merchant?.merchantName}</h2>
           </div>

           <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white mb-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Amount</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1A1A1A]">₦</span>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} className="h-16 pl-9 rounded-2xl border-none font-bold text-[22px] shadow-inner" />
                </div>
              </div>
           </Card>

           <button onClick={handlePayment} className="w-full py-5 bg-primary text-white font-bold rounded-[24px] shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Payment'}
           </button>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen flex flex-col bg-white items-center justify-center p-8 text-center">
        <CheckCircle2 size={56} className="text-primary mb-8" />
        <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Payment Successful!</h1>
        <button onClick={() => router.push('/')} className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-[20px]">Return Dashboard</button>
      </main>
    )
  }

  return null
}

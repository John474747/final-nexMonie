"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Copy, CheckCircle2, Clock, Loader2, Upload, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useUser, db, storage } from '@/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore'

const TIMER_SECONDS = 30 * 60 // 30 minutes

export default function FundAccountPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<'amount' | 'transfer' | 'submit' | 'pending'>('amount')
  const [loading, setLoading] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [senderBank, setSenderBank] = useState('')
  const [reference, setReference] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const NIGERIAN_BANKS = [
    'Access Bank', 'Zenith Bank', 'GTBank', 'First Bank', 'UBA',
    'Moniepoint', 'OPay', 'Kuda', 'PalmPay', 'Stanbic IBTC',
    'Fidelity Bank', 'Union Bank', 'Wema Bank', 'Sterling Bank', 'Polaris Bank',
  ]

  // Fetch merchant bank details from Firestore
  useEffect(() => {
    if (!db) return
    const unsub = onSnapshot(doc(db, 'app_config', 'bank_details'), (snap) => {
      if (snap.exists()) {
        setBankDetails(snap.data())
      } else {
        // Fallback defaults (founder sets these in Firestore)
        setBankDetails({
          bankName: 'Moniepoint MFB',
          accountNumber: '5051528892',
          accountName: 'NEX MONIE ESCROW',
          bankCode: '50515',
        })
      }
      setConfigLoading(false)
    })
    return () => unsub()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (stage !== 'transfer' && stage !== 'submit') return
    setTimeLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          toast({ variant: 'destructive', title: 'Time Expired', description: 'Your session expired. Please start a new deposit.' })
          setStage('amount')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [stage])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const timerColor = timeLeft < 300 ? 'text-red-500' : timeLeft < 600 ? 'text-amber-500' : 'text-[#005F56]'

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({ title: 'Copied!', description: `${field} copied.` })
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amountInput)
    if (!amt || amt < 500) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Minimum deposit is ₦500.' })
      return
    }
    setStage('transfer')
  }

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !senderBank) {
      toast({ variant: 'destructive', title: 'Missing info', description: 'Select your bank.' })
      return
    }
    setLoading(true)
    try {
      let receiptUrl = ''
      if (proofFile && storage) {
        const storageRef = ref(storage, `receipts/${user.uid}_${Date.now()}`)
        await uploadBytes(storageRef, proofFile)
        receiptUrl = await getDownloadURL(storageRef)
      }
      await addDoc(collection(db!, 'deposits'), {
        userId: user.uid,
        amount: Number(amountInput),
        senderBank,
        reference,
        receiptUrl,
        merchantBank: bankDetails?.bankName,
        merchantAccount: bankDetails?.accountNumber,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + TIMER_SECONDS * 1000),
        isActive: true,
      })
      clearInterval(timerRef.current!)
      setStage('pending')
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Submission failed. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => stage === 'amount' ? router.back() : setStage('amount')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><ChevronLeft size={22} /></button>
          <NexLogo />
          {stage === 'transfer' || stage === 'submit' ? (
            <div className={cn('flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100', timerColor)}>
              <Clock size={12} />
              <span className="text-[13px] font-black tabular-nums">{formatTimer(timeLeft)}</span>
            </div>
          ) : <div className="w-16" />}
        </div>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">
          {stage === 'amount' ? 'Fund Account' : stage === 'pending' ? 'Deposit Submitted' : 'Transfer Details'}
        </h1>
        {(stage === 'transfer' || stage === 'submit') && (
          <p className="text-[12px] text-amber-500 font-bold mt-0.5 flex items-center gap-1">
            <AlertCircle size={12} /> Complete transfer before timer expires
          </p>
        )}
      </header>

      <div className="px-6 py-8">
        {/* STAGE: Amount Entry */}
        {stage === 'amount' && (
          <form onSubmit={handleAmountSubmit} className="space-y-6 animate-in fade-in duration-300">
            <Card className="p-8 border-none shadow-nex-soft rounded-[32px] bg-white space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount to Deposit (₦)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-[#1A1A1A] text-lg">₦</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="h-16 rounded-2xl bg-gray-50 border-none font-black text-xl pl-10"
                  />
                </div>
                <p className="text-[11px] text-gray-400 px-1">Minimum: ₦500</p>
              </div>
              {[5000, 10000, 20000, 50000].map(amt => (
                <button key={amt} type="button" onClick={() => setAmountInput(amt.toString())}
                  className={cn('mr-2 px-4 py-2 rounded-xl text-[12px] font-bold border transition-all',
                    amountInput === amt.toString() ? 'bg-[#005F56] text-white border-[#005F56]' : 'bg-gray-50 text-gray-500 border-gray-100'
                  )}>
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </Card>
            <button type="submit" className="w-full py-5 bg-[#005F56] text-white font-bold rounded-[22px] shadow-lg shadow-[#005F56]/20">
              Get Account Details →
            </button>
          </form>
        )}

        {/* STAGE: Transfer Details (bank info + timer) */}
        {stage === 'transfer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Amount banner */}
            <div className="text-center py-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Transfer Exactly</p>
              <p className="text-[40px] font-black text-[#1A1A1A] tracking-tighter">₦{Number(amountInput).toLocaleString()}</p>
            </div>

            {/* Bank details card */}
            {configLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-[#005F56]" size={28} /></div>
            ) : (
              <Card className="border-none shadow-nex-soft rounded-[32px] bg-white overflow-hidden">
                <div className="bg-[#005F56]/5 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Send to this account</p>
                    <span className="text-[10px] font-bold text-[#005F56] bg-[#005F56]/10 px-2.5 py-1 rounded-full">P2P Escrow</span>
                  </div>
                  {[
                    { label: 'Bank Name', value: bankDetails?.bankName },
                    { label: 'Account Number', value: bankDetails?.accountNumber },
                    { label: 'Account Name', value: bankDetails?.accountName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                        <p className="text-[16px] font-black text-[#1A1A1A] mt-0.5">{value}</p>
                      </div>
                      <button onClick={() => handleCopy(value, label)}
                        className="w-10 h-10 rounded-xl bg-[#005F56]/10 flex items-center justify-center text-[#005F56] active:scale-90 transition-all">
                        {copiedField === label ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-1">
              <p className="text-[11px] font-bold text-amber-700">⚠️ Important</p>
              <p className="text-[12px] text-amber-600">Transfer the exact amount shown. Do not round up or down. Use your registered bank account. Your balance will be credited after verification.</p>
            </div>

            <button onClick={() => setStage('submit')} className="w-full py-5 bg-[#005F56] text-white font-bold rounded-[22px] shadow-lg shadow-[#005F56]/20">
              I've Completed the Transfer →
            </button>
          </div>
        )}

        {/* STAGE: Submit Proof */}
        {stage === 'submit' && (
          <form onSubmit={handleSubmitProof} className="space-y-6 animate-in slide-in-from-right duration-300">
            <Card className="p-8 border-none shadow-nex-soft rounded-[32px] bg-white space-y-6">
              <p className="text-[13px] font-bold text-[#1A1A1A]">Confirm your transfer details</p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Bank</label>
                <select
                  value={senderBank}
                  onChange={e => setSenderBank(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-gray-50 border-none font-medium text-[14px] px-4 text-[#1A1A1A] appearance-none"
                  required
                >
                  <option value="">Select your bank</option>
                  {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transfer Reference (optional)</label>
                <Input type="text" placeholder="e.g. narration or ref number" value={reference} onChange={e => setReference(e.target.value)} className="h-14 rounded-2xl bg-gray-50 border-none font-medium" />
              </div>

              <div>
                <Input type="file" id="receipt" className="hidden" accept="image/*,application/pdf" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                <label htmlFor="receipt" className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 font-bold text-[13px] cursor-pointer hover:border-[#005F56] transition-colors">
                  {proofFile ? <><CheckCircle2 size={16} className="text-emerald-500" /> {proofFile.name.slice(0, 24)}</> : <><Upload size={16} /> Upload Payment Proof</>}
                </label>
              </div>
            </Card>
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#005F56] text-white font-bold rounded-[22px] shadow-lg shadow-[#005F56]/20 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Submit for Verification'}
            </button>
          </form>
        )}

        {/* STAGE: Pending */}
        {stage === 'pending' && (
          <div className="text-center space-y-8 animate-in zoom-in duration-500 py-10">
            <div className="w-28 h-28 bg-[#005F56]/10 rounded-[40px] flex items-center justify-center text-[#005F56] mx-auto">
              <CheckCircle2 size={52} />
            </div>
            <div>
              <h2 className="text-[28px] font-bold text-[#1A1A1A]">Deposit Submitted!</h2>
              <p className="text-[14px] text-gray-400 mt-2 px-6">Your ₦{Number(amountInput).toLocaleString()} deposit is under review. Your wallet will be credited once a merchant confirms payment — usually within 15 minutes.</p>
            </div>
            <div className="bg-[#005F56]/5 rounded-2xl p-5 text-left space-y-2">
              <p className="text-[11px] font-bold text-[#005F56] uppercase tracking-widest">What happens next</p>
              <p className="text-[13px] text-gray-500">1. Our merchant verifies your transfer</p>
              <p className="text-[13px] text-gray-500">2. Your wallet is credited instantly</p>
              <p className="text-[13px] text-gray-500">3. You get a notification</p>
            </div>
            <button onClick={() => router.push('/')} className="w-full py-5 bg-[#1A1A1A] text-white font-bold rounded-[22px]">Return to Dashboard</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  )
}

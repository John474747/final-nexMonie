"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Zap, 
  Tv, 
  Wifi, 
  Target, 
  GraduationCap, 
  CheckCircle2, 
  Loader2, 
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useUser, useDoc, db } from '@/firebase'
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

type Category = { id: string, name: string, icon: React.ReactNode, color: string }
type Provider = { id: string, name: string }
type Package = { id: string, name: string, price: number }

const CATEGORIES: Category[] = [
  { id: 'electricity', name: 'Electricity', icon: <Zap size={20} />, color: 'bg-yellow-50 text-yellow-600' },
  { id: 'cable', name: 'Cable TV', icon: <Tv size={20} />, color: 'bg-blue-50 text-blue-600' },
  { id: 'internet', name: 'Internet', icon: <Wifi size={20} />, color: 'bg-purple-50 text-purple-600' },
  { id: 'betting', name: 'Betting', icon: <Target size={20} />, color: 'bg-red-50 text-red-600' },
  { id: 'education', name: 'Education', icon: <GraduationCap size={20} />, color: 'bg-emerald-50 text-emerald-600' },
]

export default function PayBillsWorkflow() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [stage, setStage] = useState<'category' | 'details' | 'review' | 'success'>('category')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)

  const [providers, setProviders] = useState<Provider[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    if (selectedCategory) {
      setProviders([
        { id: 'p1', name: selectedCategory === 'cable' ? 'DStv' : 'Ikeja Electric' },
        { id: 'p2', name: selectedCategory === 'cable' ? 'GOtv' : 'Eko Electric' },
        { id: 'p3', name: selectedCategory === 'cable' ? 'StarTimes' : 'Abuja Electric' },
      ])
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedProvider) {
      setPackages([
        { id: 'pkg1', name: 'Premium Package', price: 12500 },
        { id: 'pkg2', name: 'Elite Package', price: 25000 },
        { id: 'pkg3', name: 'Basic Plan', price: 5000 },
      ])
    }
  }, [selectedProvider])

  const handleValidate = async () => {
    if (accountNumber.length < 8) return
    setValidating(true)
    await new Promise(r => setTimeout(r, 1000))
    setCustomerName("SARAH NICHOLAS")
    setValidating(false)
  }

  if (stage === 'category') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Pay Bills</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setStage('details'); }}
                className="p-6 bg-white rounded-[32px] shadow-soft border border-transparent hover:border-primary/20 flex flex-col items-center text-center gap-3 transition-all active:scale-95 group"
              >
                <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center group-hover:scale-110 transition-transform", cat.color)}>
                  {cat.icon}
                </div>
                <span className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </main>
    )
  }

  if (stage === 'details') {
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setStage('category')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Bill Details</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-6 py-8 space-y-6">
          <Card className="p-8 border-none shadow-nex-soft rounded-[40px] bg-white space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Smartcard / Meter Number</label>
              <div className="relative">
                <Input 
                  value={accountNumber} 
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleValidate}
                  placeholder="Enter Number" 
                  className="h-14 rounded-2xl bg-gray-50 border-none font-bold text-lg pr-12" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   {validating ? <Loader2 className="animate-spin text-primary" size={18} /> : accountNumber.length >= 8 && <CheckCircle2 className="text-emerald-500" size={18} />}
                </div>
              </div>
              {customerName && <p className="text-[11px] text-emerald-500 font-bold ml-1 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12} /> {customerName}</p>}
            </div>

            {selectedProvider && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Package</label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                    <SelectValue placeholder="Choose Plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {packages.map(pkg => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} - ₦{pkg.price.toLocaleString()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>

          <button 
            disabled={!selectedPackage || !customerName}
            onClick={() => setStage('review')}
            className="w-full py-5 bg-primary text-white font-bold rounded-[22px] shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
          >
            Review Payment
          </button>
        </div>
      </main>
    )
  }

  if (stage === 'review') {
    const pkg = packages.find(p => p.id === selectedPackage)
    return (
      <main className="min-h-screen pb-32 bg-[#F8FAF9]">
        <header className="px-6 pt-8 pb-4 bg-white">
           <button onClick={() => setStage('details')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center"><ChevronLeft size={22} /></button>
        </header>
        <div className="px-6 py-10 flex flex-col items-center">
           <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary mb-6 shadow-sm"><CreditCard size={36} /></div>
           <h2 className="text-[32px] font-black italic tracking-tighter text-[#1A1A1A] mb-1">₦{pkg?.price.toLocaleString()}</h2>
           <p className="text-[13px] text-gray-500 font-bold uppercase tracking-widest mb-10">Bill Payment Review</p>
           
           <Card className="w-full p-8 border-none shadow-nex-soft rounded-[32px] bg-white space-y-5 mb-10">
              <SummaryRow label="Biller" value={providers.find(p => p.id === selectedProvider)?.name || ''} />
              <SummaryRow label="Customer" value={customerName} />
              <SummaryRow label="Number" value={accountNumber} />
              <SummaryRow label="Fee" value="₦100.00" />
           </Card>

           <button onClick={() => setStage('success')} className="w-full py-5 bg-primary text-white font-bold rounded-[24px] shadow-xl">Complete Payment</button>
        </div>
      </main>
    )
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/30">
           <CheckCircle2 size={56} />
        </div>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-[15px] font-medium mb-12">Your bill payment has been processed and confirmed by the provider.</p>
        <div className="grid grid-cols-2 gap-4 w-full">
           <button onClick={() => router.push('/')} className="py-5 bg-[#1A1A1A] text-white font-bold rounded-2xl">Return Home</button>
           <button className="py-5 bg-gray-50 text-[#1A1A1A] font-bold rounded-2xl border border-gray-100">Share Receipt</button>
        </div>
      </main>
    )
  }

  return null
}

function SummaryRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-[14px] font-bold text-[#1A1A1A]">{value}</span>
    </div>
  )
}

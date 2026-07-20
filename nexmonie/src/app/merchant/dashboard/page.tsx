"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Activity, Plus, TrendingUp, LayoutDashboard, Megaphone,
  History, Settings, CircleDollarSign, Loader2, ChevronRight, ShieldCheck,
  ShoppingBag, Clock, CheckCircle2, XCircle, ArrowDownCircle, Eye
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { NexLogo } from '@/components/ui/NexLogo'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser, useCollection, useDoc } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function MerchantDashboard() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [activeView, setActiveView] = useState<'overview' | 'ads' | 'orders' | 'deposits'>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data: profile, loading: profileLoading } = useDoc<any>(user ? { table: 'merchant_profiles', id: user.uid } : null)
  const { data: ads, loading: adsLoading } = useCollection<any>(user ? { table: 'p2p_ads', filter: { column: 'createdBy', value: user.uid } } : null)
  const { data: orders, loading: ordersLoading } = useCollection<any>(user ? { table: 'p2p_orders', filter: { column: 'sellerId', value: user.uid } } : null)
  // All pending deposits — merchants handle all platform deposits
  const { data: deposits } = useCollection<any>({ table: 'deposits', filter: { column: 'status', value: 'pending' }, order: 'createdAt', limit: 50 })

  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject') => {
    if (!db) return
    setActionLoading(depositId + action)
    try {
      const { runTransaction, doc, collection, addDoc, serverTimestamp, getDoc } = await import('firebase/firestore')

      if (action === 'approve') {
        await runTransaction(db, async (txn) => {
          const depositRef = doc(db, 'deposits', depositId)
          const depositSnap = await txn.get(depositRef)
          if (!depositSnap.exists()) throw new Error('Deposit not found')
          const deposit = depositSnap.data()
          if (deposit.status !== 'pending') throw new Error(`Already ${deposit.status}`)

          const walletRef = doc(db, 'wallets', deposit.userId)
          const walletSnap = await txn.get(walletRef)
          const current = walletSnap.data()?.available || 0

          txn.update(depositRef, { status: 'confirmed', confirmedAt: serverTimestamp(), updatedAt: serverTimestamp() })
          txn.update(walletRef, { available: current + deposit.amount, lastUpdated: serverTimestamp() })

          const txRef = doc(collection(db, 'transactions'))
          txn.set(txRef, {
            userId: deposit.userId, depositId,
            title: 'P2P Deposit', amount: deposit.amount,
            type: 'income', category: 'deposit', status: 'completed',
            referenceId: `DEP-${depositId.slice(0, 8).toUpperCase()}`,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          })
        })
        toast({ title: '✅ Approved & Credited', description: 'Wallet credited successfully.' })
      } else {
        const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore')
        await updateDoc(doc(db, 'deposits', depositId), { status: 'rejected', rejectedAt: serverTimestamp(), updatedAt: serverTimestamp() })
        toast({ title: '❌ Rejected', description: 'Deposit rejected.' })
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  const pendingDeposits = deposits?.filter(d => d.status === 'pending') || []

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-6 pt-10 pb-6 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/finances')} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A]"><ChevronLeft size={22} /></button>
          <NexLogo />
          <button className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-primary"><Settings size={20} /></button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-emerald-50 text-emerald-500 border-none text-[9px] font-black uppercase tracking-widest">Approved Merchant</Badge>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400">Online</span>
          {pendingDeposits.length > 0 && (
            <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] font-black ml-auto">
              {pendingDeposits.length} Pending Deposits
            </Badge>
          )}
        </div>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">Merchant Console</h1>
      </header>

      <div className="px-6 py-8">

        {/* OVERVIEW */}
        {activeView === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="grid grid-cols-2 gap-4">
              <StatCard label="Completed" value={profile?.totalTrades || '0'} sub="Total Trades" />
              <StatCard label="Rate" value={`${profile?.completionRate || '0'}%`} sub="Completion" />
              <StatCard label="Revenue" value={`₦${(profile?.revenue || 0).toLocaleString()}`} sub="Earnings" />
              <StatCard label="Volume" value={`₦${(profile?.tradingVolume || 0).toLocaleString()}`} sub="Vol (30d)" />
            </section>

            {/* Pending Deposits Alert */}
            {pendingDeposits.length > 0 && (
              <Card className="p-5 border-none rounded-[24px] bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ArrowDownCircle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-amber-800">{pendingDeposits.length} Deposit{pendingDeposits.length > 1 ? 's' : ''} Awaiting</p>
                      <p className="text-[10px] text-amber-500">Confirm payment to credit users</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveView('deposits')} className="text-[11px] font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-xl">View →</button>
                </div>
              </Card>
            )}

            <Card className="p-8 border-none bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-white rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign size={16} className="text-primary" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Merchant Wallet</span>
                </div>
                <p className="text-[32px] font-black tracking-tighter">₦{(profile?.revenue || 0).toLocaleString()}</p>
                <p className="text-[12px] text-white/40 mt-1">Available for withdrawal</p>
              </div>
            </Card>
          </div>
        )}

        {/* DEPOSITS — core merchant function */}
        {activeView === 'deposits' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              {pendingDeposits.length} Pending Deposit Requests
            </p>
            {pendingDeposits.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle2 size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="text-[13px] font-bold text-gray-300">All deposits cleared</p>
              </div>
            ) : pendingDeposits.map((dep: any) => (
              <Card key={dep.id} className="p-6 border border-gray-50 rounded-[24px] bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[22px] font-black text-[#1A1A1A]">₦{(dep.amount || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{dep.senderBank || 'Bank Transfer'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase">Pending</span>
                    <p className="text-[10px] text-gray-300">{formatTime(dep.createdAt)}</p>
                  </div>
                </div>

                {dep.reference && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference</p>
                    <p className="text-[13px] font-bold text-[#1A1A1A]">{dep.reference}</p>
                  </div>
                )}

                {dep.receiptUrl && (
                  <a href={dep.receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] font-bold text-[#005F56]">
                    <Eye size={14} /> View Payment Proof
                  </a>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDepositAction(dep.id, 'approve')}
                    disabled={!!actionLoading}
                    className="flex-1 h-12 bg-[#005F56] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-[#005F56]/20"
                  >
                    {actionLoading === dep.id + 'approve' ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Confirm Payment</>}
                  </button>
                  <button
                    onClick={() => handleDepositAction(dep.id, 'reject')}
                    disabled={!!actionLoading}
                    className="flex-1 h-12 bg-red-50 text-red-500 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading === dep.id + 'reject' ? <Loader2 size={16} className="animate-spin" /> : <><XCircle size={16} /> Reject</>}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ADS */}
        {activeView === 'ads' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {adsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : !ads?.length ? (
              <div className="text-center py-20">
                <Megaphone size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="text-[14px] font-bold text-gray-300">No active ads</p>
                <p className="text-[12px] text-gray-300 mt-1">Tap + to create your first listing</p>
              </div>
            ) : ads.map((ad: any) => (
              <Card key={ad.id} className="p-5 border border-gray-50 rounded-2xl bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-black", ad.type === 'buy' ? 'bg-emerald-500' : 'bg-red-500')}>
                    {ad.type?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1A1A1A]">{ad.asset} · ₦{(ad.price || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{ad.status}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </Card>
            ))}
          </div>
        )}

        {/* ORDERS */}
        {activeView === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : !orders?.length ? (
              <div className="text-center py-20">
                <History size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="text-[14px] font-bold text-gray-300">No order history</p>
              </div>
            ) : orders.map((order: any) => (
              <Card key={order.id} className="p-4 border border-gray-50 rounded-2xl bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", order.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500')}>
                    {order.status === 'completed' ? <ShieldCheck size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1A1A1A]">{order.asset} · ₦{(order.fiatAmount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{order.status}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </Card>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <NavButton active={activeView === 'overview'} onClick={() => setActiveView('overview')} icon={<LayoutDashboard />} label="Home" />
        <NavButton active={activeView === 'ads'} onClick={() => setActiveView('ads')} icon={<Megaphone />} label="Ads" />
        <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 -mt-10 border-4 border-[#F8FAF9] active:scale-95 transition-all"><Plus size={24} /></button>
        <NavButton active={activeView === 'deposits'} onClick={() => setActiveView('deposits')} icon={<ArrowDownCircle />} label="Deposits" badge={pendingDeposits.length} />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={<Activity />} label="Orders" />
      </nav>
    </main>
  )
}

function StatCard({ label, value, sub }: any) {
  return (
    <Card className="p-5 border-none shadow-soft rounded-[28px] bg-white flex flex-col gap-1">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-[18px] font-black italic tracking-tighter text-[#1A1A1A]">{value}</span>
      <span className="text-[10px] font-medium text-gray-300">{sub}</span>
    </Card>
  )
}

function NavButton({ active, onClick, icon, label, badge }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 transition-all flex-1 py-2 relative", active ? "text-primary" : "text-gray-300")}>
      {React.cloneElement(icon, { size: 22 })}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
      {badge > 0 && <span className="absolute top-0 right-2 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{badge}</span>}
    </button>
  )
}

function formatTime(ts: any): string {
  if (!ts) return ''
  try {
    const date = ts?.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

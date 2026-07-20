"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import {
  collection, query, orderBy, onSnapshot, doc, getDoc, getDocs, where, limit, Timestamp
} from 'firebase/firestore'
import { auth, db, useUser } from '@/firebase'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Users, Wallet, TrendingUp, ShieldCheck, Clock, CheckCircle2, XCircle,
  LogOut, Activity, ChevronRight, AlertCircle, Loader2, LayoutDashboard,
  Store, ArrowDownCircle, RefreshCw
} from 'lucide-react'

const FOUNDER_EMAILS = ['www.henryhart23@gmail.com', 'atuchukwuarinze742@gmail.com']

type Tab = 'overview' | 'deposits' | 'merchants' | 'users'

export default function FounderDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [deposits, setDeposits] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Auth guard — founders only
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    const email = user.email?.toLowerCase() || ''
    if (!FOUNDER_EMAILS.includes(email)) {
      router.replace('/')
    }
  }, [user, authLoading, router])

  // Real-time listeners
  useEffect(() => {
    if (!db) return
    const unsubDeposits = onSnapshot(
      query(collection(db, 'deposits'), orderBy('createdAt', 'desc'), limit(100)),
      snap => setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    const unsubMerchants = onSnapshot(
      query(collection(db, 'merchant_profiles'), orderBy('createdAt', 'desc')),
      snap => setMerchants(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    const unsubUsers = onSnapshot(
      query(collection(db, 'users'), orderBy('joinedAt', 'desc'), limit(100)),
      snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return () => { unsubDeposits(); unsubMerchants(); unsubUsers() }
  }, [])

  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject') => {
    if (!db) return
    setActionLoading(depositId + action)
    try {
      const { runTransaction, doc, collection, serverTimestamp, updateDoc } = await import('firebase/firestore')

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
        toast({ title: '✅ Approved', description: 'Wallet credited successfully.' })
      } else {
        await updateDoc(doc(db, 'deposits', depositId), { status: 'rejected', rejectedAt: serverTimestamp(), updatedAt: serverTimestamp() })
        toast({ title: '❌ Rejected', description: 'Deposit rejected.' })
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMerchantAction = async (merchantId: string, action: 'approve' | 'suspend' | 'reject') => {
    if (!db) return
    setActionLoading(merchantId + action)
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const statusMap: Record<string, string> = { approve: 'approved', suspend: 'suspended', reject: 'rejected' }
      const newStatus = statusMap[action]
      await updateDoc(doc(db, 'merchant_profiles', merchantId), { status: newStatus, updatedAt: serverTimestamp() })
      if (action === 'approve') {
        const merchant = merchants.find(m => m.id === merchantId)
        if (merchant?.userId) {
          await updateDoc(doc(db, 'users', merchant.userId), { role: 'merchant', updatedAt: serverTimestamp() })
        }
      }
      toast({ title: 'Done', description: `Merchant ${newStatus}.` })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth!)
    router.replace('/login')
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]"><Loader2 className="animate-spin text-[#005F56]" size={32} /></div>
  }

  // Stats
  const pendingDeposits = deposits.filter(d => d.status === 'pending')
  const confirmedDeposits = deposits.filter(d => d.status === 'confirmed')
  const totalDeposited = confirmedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0)
  const pendingMerchants = merchants.filter(m => m.status === 'pending')
  const approvedMerchants = merchants.filter(m => m.status === 'approved')

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 border-b border-white/5 flex items-center justify-between sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#005F56] flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Founder Console</p>
            <p className="text-[14px] font-bold text-white leading-none">nex Monie Admin</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-white/40 text-[12px] font-bold hover:text-white/70 transition-colors">
          <LogOut size={16} />
        </button>
      </header>

      {/* Nav Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {([
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
          { id: 'deposits', label: 'Deposits', icon: <ArrowDownCircle size={14} />, badge: pendingDeposits.length },
          { id: 'merchants', label: 'Merchants', icon: <Store size={14} />, badge: pendingMerchants.length },
          { id: 'users', label: 'Users', icon: <Users size={14} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode; badge?: number }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all relative ${
              activeTab === tab.id
                ? 'bg-[#005F56] text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.icon}
            {tab.label}
            {(tab.badge || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Users" value={users.length.toString()} icon={<Users size={18} />} color="#005F56" />
              <StatCard label="Pending Deposits" value={pendingDeposits.length.toString()} icon={<Clock size={18} />} color="#F59E0B" urgent={pendingDeposits.length > 0} />
              <StatCard label="Total Deposited" value={`₦${totalDeposited.toLocaleString()}`} icon={<TrendingUp size={18} />} color="#10B981" />
              <StatCard label="Active Merchants" value={approvedMerchants.length.toString()} icon={<Store size={18} />} color="#6366F1" />
            </div>

            <Card className="bg-white/5 border-white/5 p-5 rounded-[24px] space-y-3">
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Recent Activity</p>
              {deposits.slice(0, 6).map(d => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-[13px] font-bold text-white">₦{(d.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-white/30">{d.senderBank || 'Bank Transfer'} · {formatTime(d.createdAt)}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
              {deposits.length === 0 && <p className="text-[12px] text-white/30 text-center py-4">No deposits yet</p>}
            </Card>
          </div>
        )}

        {/* DEPOSITS */}
        {activeTab === 'deposits' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">{deposits.length} Total · {pendingDeposits.length} Pending</p>
            </div>
            {deposits.map(d => (
              <Card key={d.id} className="bg-white/5 border-white/5 rounded-[20px] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-black text-white">₦{(d.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{d.senderBank} · {formatTime(d.createdAt)}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                {d.receiptUrl && (
                  <a href={d.receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#005F56] underline underline-offset-2">
                    View Receipt →
                  </a>
                )}

                {d.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDepositAction(d.id, 'approve')}
                      disabled={!!actionLoading}
                      className="flex-1 h-10 bg-emerald-500 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {actionLoading === d.id + 'approve' ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Approve</>}
                    </button>
                    <button
                      onClick={() => handleDepositAction(d.id, 'reject')}
                      disabled={!!actionLoading}
                      className="flex-1 h-10 bg-red-500/20 text-red-400 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {actionLoading === d.id + 'reject' ? <Loader2 size={14} className="animate-spin" /> : <><XCircle size={14} /> Reject</>}
                    </button>
                  </div>
                )}
              </Card>
            ))}
            {deposits.length === 0 && <EmptyState message="No deposits yet" />}
          </div>
        )}

        {/* MERCHANTS */}
        {activeTab === 'merchants' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">{merchants.length} Total</p>
            {merchants.map(m => (
              <Card key={m.id} className="bg-white/5 border-white/5 rounded-[20px] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-bold text-white">{m.nickname || m.id}</p>
                    <p className="text-[10px] text-white/30">{m.totalTrades || 0} trades · {m.completionRate || 0}% completion</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                {m.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMerchantAction(m.id, 'approve')}
                      disabled={!!actionLoading}
                      className="flex-1 h-10 bg-emerald-500 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {actionLoading === m.id + 'approve' ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Approve</>}
                    </button>
                    <button
                      onClick={() => handleMerchantAction(m.id, 'reject')}
                      disabled={!!actionLoading}
                      className="flex-1 h-10 bg-red-500/20 text-red-400 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {m.status === 'approved' && (
                  <button
                    onClick={() => handleMerchantAction(m.id, 'suspend')}
                    disabled={!!actionLoading}
                    className="w-full h-9 bg-amber-500/20 text-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    Suspend Merchant
                  </button>
                )}
              </Card>
            ))}
            {merchants.length === 0 && <EmptyState message="No merchants registered" />}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">{users.length} Total Users</p>
            {users.map(u => (
              <Card key={u.id} className="bg-white/5 border-white/5 rounded-[20px] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-white">{u.displayName || 'User'}</p>
                    <p className="text-[11px] text-white/30">{u.email} · {u.tier || 'nex Basic'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-[9px] font-black uppercase ${u.role === 'merchant' ? 'bg-[#005F56]/30 text-[#005F56]' : 'bg-white/10 text-white/40'} border-none`}>
                      {u.role || 'user'}
                    </Badge>
                    {u.isVerified && <Badge className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border-none">Verified</Badge>}
                  </div>
                </div>
              </Card>
            ))}
            {users.length === 0 && <EmptyState message="No users yet" />}
          </div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, icon, color, urgent }: { label: string; value: string; icon: React.ReactNode; color: string; urgent?: boolean }) {
  return (
    <Card className={`bg-white/5 border-white/5 rounded-[20px] p-5 ${urgent ? 'border border-amber-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div style={{ color }} className="opacity-80">{icon}</div>
        {urgent && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
      </div>
      <p className="text-[20px] font-black text-white">{value}</p>
      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{label}</p>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400' },
    approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    suspended: { bg: 'bg-red-500/20', text: 'text-red-400' },
  }
  const s = map[status] || { bg: 'bg-white/10', text: 'text-white/40' }
  return (
    <span className={`${s.bg} ${s.text} px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`}>
      {status}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-white/20">
      <Activity size={32} className="mx-auto mb-3 opacity-30" />
      <p className="text-[13px] font-bold">{message}</p>
    </div>
  )
}

function formatTime(ts: any): string {
  if (!ts) return ''
  try {
    const date = ts?.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

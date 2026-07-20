"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Filter, Search, ShieldCheck, Star, ArrowRightLeft, Loader2, AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { NexLogo } from '@/components/ui/NexLogo'
import { TradeModal } from '@/components/p2p/TradeModal'
import { ActiveTradeScreen } from '@/components/p2p/ActiveTradeScreen'
import { P2PListing, P2PTrade } from '@/types/p2p'
import { cn } from '@/lib/utils'
import { useUser, useCollection, db } from '@/firebase'
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export default function P2PMarketplace() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY')
  const [assetType, setAssetType] = useState('USDT')
  const [selectedAd, setSelectedAd] = useState<P2PListing | null>(null)
  const [activeTrade, setActiveTrade] = useState<P2PTrade | null>(null)

  // Fetch listings from Firestore
  const { data: allListings, loading } = useCollection<any>({
    table: 'p2p_ads',
    filter: { column: 'status', value: 'active' },
    order: 'createdAt',
  })

  const listings = (allListings || []).filter((ad: any) =>
    ad.type === activeTab && ad.asset === assetType
  )

  // Real-time active trade listener
  const { data: tradeData } = useCollection<any>(
    activeTrade ? { table: 'p2p_orders', filter: { column: 'id', value: activeTrade.id } } : null
  )

  const handleInitiateTrade = async (fiat: number, asset: number) => {
    if (!user || !selectedAd || !db) return

    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      const docRef = await addDoc(collection(db, 'p2p_orders'), {
        adId: selectedAd.id,
        buyerId: user.uid,
        sellerId: selectedAd.advertiser_id || selectedAd.createdBy,
        asset: selectedAd.asset_type || selectedAd.asset,
        quantity: asset,
        fiatAmount: fiat,
        price: selectedAd.exchange_rate || selectedAd.price,
        status: 'pending_payment',
        paymentMethod: selectedAd.payment_methods?.[0] || 'Bank Transfer',
        referenceId: 'NEX-P2P-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        sellerBankDetails: {
          bankName: 'Moniepoint MFB',
          accountNumber: '5051528892',
          accountName: selectedAd.advertiser_name || 'Merchant',
        },
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setActiveTrade({ id: docRef.id, status: 'pending_payment', fiatAmount: fiat, asset, ...selectedAd } as any)
      setSelectedAd(null)
      toast({ title: 'Order Created', description: 'Complete payment within 15 minutes.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Order Failed', description: err.message })
    }
  }

  const handlePaymentMarked = async () => {
    if (!activeTrade || !db) return
    await updateDoc(doc(db, 'p2p_orders', activeTrade.id), {
      status: 'payment_marked',
      updatedAt: serverTimestamp(),
    })
    setActiveTrade(prev => prev ? { ...prev, status: 'payment_marked' } : null)
  }

  const handleCancelTrade = async () => {
    if (!activeTrade || !db) return
    if (!confirm('Cancel this trade?')) return
    await updateDoc(doc(db, 'p2p_orders', activeTrade.id), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    })
    setActiveTrade(null)
  }

  if (activeTrade) {
    return (
      <ActiveTradeScreen
        trade={activeTrade}
        onPaymentMarked={handlePaymentMarked}
        onCancel={handleCancelTrade}
      />
    )
  }

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-6 pt-10 pb-4 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A]">
            <ChevronLeft size={22} />
          </button>
          <NexLogo />
          <button className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500">
            <Filter size={20} />
          </button>
        </div>

        {/* Asset Selector */}
        <div className="flex gap-2 mb-4">
          {['USDT', 'BTC', 'ETH'].map(asset => (
            <button
              key={asset}
              onClick={() => setAssetType(asset)}
              className={cn(
                'px-4 py-2 rounded-xl text-[12px] font-bold transition-all',
                assetType === asset ? 'bg-[#005F56] text-white' : 'bg-gray-100 text-gray-500'
              )}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* Buy/Sell Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {(['BUY', 'SELL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 rounded-xl font-bold text-[13px] transition-all',
                activeTab === tab
                  ? tab === 'BUY' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#005F56]" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <AlertCircle size={36} className="mx-auto text-gray-200" />
            <p className="text-[14px] font-bold text-gray-300">No {activeTab} listings for {assetType}</p>
            <p className="text-[12px] text-gray-200">Check back soon or try another asset</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((ad: any) => (
              <Card key={ad.id} className="p-5 border-none shadow-soft rounded-[24px] bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#005F56]/10 rounded-2xl flex items-center justify-center text-[#005F56] font-black text-[14px]">
                      {(ad.advertiser_name || ad.merchantName || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[13px] font-bold text-[#1A1A1A]">{ad.advertiser_name || ad.merchantName || 'Merchant'}</p>
                        <ShieldCheck size={12} className="text-[#005F56]" />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <p className="text-[10px] text-gray-400">{ad.completionRate || 98}% · {ad.ordersCount || 0} orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-black italic text-[#005F56] tracking-tighter tabular-nums">
                      ₦{(ad.exchange_rate || ad.price || 0).toLocaleString()}
                    </p>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">NGN / {ad.asset_type || ad.asset}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-4">
                  <div>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Available</p>
                    <p className="text-[12px] font-black italic text-gray-600 tabular-nums">
                      {ad.available_amount || ad.availableQuantity || 0} {ad.asset_type || ad.asset}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Limits</p>
                    <p className="text-[12px] font-black italic text-[#1A1A1A] tabular-nums">
                      ₦{(ad.min_limit || ad.minLimit || 0).toLocaleString()} – ₦{(ad.max_limit || ad.maxLimit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {(ad.payment_methods || ad.paymentMethods || ['Bank Transfer']).map((p: string) => (
                      <span key={p} className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 rounded-full text-[8px] font-bold uppercase">{p}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedAd(ad)}
                    className={cn(
                      'px-8 py-2.5 rounded-xl font-black italic text-[11px] shadow-lg active:scale-95 transition-all text-white',
                      activeTab === 'BUY' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
                    )}
                  >
                    {activeTab} {ad.asset_type || ad.asset}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TradeModal
        listing={selectedAd}
        onClose={() => setSelectedAd(null)}
        onConfirm={handleInitiateTrade}
      />
    </main>
  )
}

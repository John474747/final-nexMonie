"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Copy,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NexLogo } from '@/components/ui/NexLogo'
import { useUser } from '@/firebase'
import { useDoc, useCollection, db } from '@/firebase'
import { p2pService } from '@/services/p2p.service'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function P2POrderDetails() {
  const router = useRouter()
  const { orderId } = useParams() as { orderId: string }
  const { user } = useUser()
  const { toast } = useToast()

  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState('15:00')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data: order, loading: orderLoading } = useDoc<any>({ table: 'p2p_orders', id: orderId })
  const { data: messages } = useCollection<any>({ 
    table: `p2p_orders/${orderId}/messages`,
    order: 'createdAt',
    limit: 50 
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return
    await p2pService.sendMessage(orderId, user.uid, message)
    setMessage('')
  }

  const handleMarkAsPaid = async () => {
    await p2pService.updateOrderStatus(orderId, 'paid')
    await p2pService.sendMessage(orderId, 'system', 'Buyer has marked the order as paid. Seller will verify and release assets.', 'system')
    toast({ title: "Payment Notified", description: "The seller has been alerted to verify your transfer." })
  }

  if (orderLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" size={32} /></div>
  }

  if (!order) return null

  const isBuyer = user?.id === order.buyerId
  const statusColors = {
    pending: 'bg-amber-50 text-amber-600',
    unpaid: 'bg-amber-50 text-amber-600',
    paid: 'bg-blue-50 text-blue-600',
    released: 'bg-emerald-50 text-emerald-600',
    completed: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-gray-50 text-gray-500',
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <header className="px-6 pt-10 pb-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A]"><ChevronLeft size={22} /></button>
          <div className="text-center">
            <h1 className="text-[15px] font-bold text-[#1A1A1A]">P2P Buy Order</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.referenceId}</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="flex items-center justify-between">
           <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none", statusColors[order.status as keyof typeof statusColors])}>
             {order.status}
           </Badge>
           <div className="flex items-center gap-2 text-primary">
              <Clock size={14} className="animate-pulse" />
              <span className="text-[14px] font-black tabular-nums">{timeLeft}</span>
           </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-6 py-8">
        <div className="space-y-6 mb-20">
          <Card className="p-8 border-none shadow-soft rounded-[32px] bg-white flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mb-4 shadow-inner">
                <ShieldCheck size={32} />
             </div>
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total to Pay</p>
             <h2 className="text-nex-display font-black italic tracking-tighter text-primary leading-none mb-1">₦{order.fiatAmount.toLocaleString()}</h2>
             <p className="text-nex-sub font-bold text-[#1A1A1A]">Receive {order.quantity.toFixed(6)} {order.asset}</p>
          </Card>

          <section>
            <h3 className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Seller Payment Method</h3>
            <Card className="p-6 border-none shadow-soft rounded-[32px] bg-white space-y-5">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Bank Name</p>
                <p className="text-[15px] font-bold text-[#1A1A1A]">Moniepoint MFB</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Account Name</p>
                <p className="text-[15px] font-bold text-[#1A1A1A]">NEXMONIE SOLUTIONS LTD</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Account Number</p>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[22px] font-black tracking-tight tracking-[0.05em]">5051528892</span>
                  <button onClick={() => { navigator.clipboard.writeText('5051528892'); toast({ title: 'Copied!' }) }} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary"><Copy size={16} /></button>
                </div>
              </div>
            </Card>
          </section>

          <div className="bg-amber-50 p-5 rounded-[28px] border border-amber-100 flex gap-4">
             <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-1" />
             <div>
                <h4 className="text-[13px] font-bold text-amber-900 mb-1">Security Warning</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  DO NOT mention crypto, USDT, or nexMonie in the bank transfer reference. This protects both your account and the seller's account from bank freezes.
                </p>
             </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-3 px-1">
               <h3 className="text-nex-xs font-bold text-gray-400 uppercase tracking-widest">Order Chat</h3>
               <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Seller is Online</span>
            </div>
            <Card className="border-none shadow-soft rounded-[32px] bg-white h-96 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-y-auto p-5 space-y-4">
                 <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Escrow System</p>
                    <p className="text-[11px] text-[#1A1A1A] font-medium leading-relaxed mt-1">
                       The seller's {order.asset} is currently locked in nexMonie Escrow. It is safe to proceed with the transfer.
                    </p>
                 </div>
                 {messages?.map((m: any) => (
                   <div key={m.id} className={cn("max-w-[85%] p-4 rounded-[22px] text-[13px] font-medium shadow-sm", m.senderId === user?.id ? "bg-primary text-white ml-auto rounded-tr-none" : m.senderId === 'system' ? "bg-amber-50 text-amber-700 mx-auto text-center text-[10px] font-bold uppercase tracking-widest border border-amber-100" : "bg-gray-50 text-[#1A1A1A] rounded-tl-none")}>
                     {m.text}
                   </div>
                 ))}
                 <div ref={chatEndRef} />
               </div>
               <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                 <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send a message to the seller..." className="bg-white border-none rounded-2xl h-14" />
                 <button type="submit" className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"><Send size={24} /></button>
               </form>
            </Card>
          </section>
        </div>
      </ScrollArea>

      <div className="p-6 bg-white border-t border-gray-100 space-y-3 shrink-0 pb-10">
        {order.status === 'pending' && isBuyer && (
          <button onClick={handleMarkAsPaid} className="w-full h-16 bg-primary text-white font-bold rounded-[22px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             Payment Completed <ArrowRight size={20} />
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
           <button className="h-12 bg-gray-50 text-gray-500 font-bold rounded-xl text-xs border border-gray-100">Cancel Order</button>
           <button className="h-12 bg-gray-50 text-accent font-bold rounded-xl text-xs border border-gray-100">Submit Appeal</button>
        </div>
      </div>
    </main>
  )
}

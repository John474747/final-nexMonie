"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { InviteDialog } from '@/components/dashboard/InviteDialog'
import { 
  Bell, 
  User, 
  Send, 
  Download, 
  QrCode, 
  Target, 
  FileText, 
  Smartphone, 
  Wifi, 
  Zap, 
  Coins, 
  Lock, 
  Umbrella, 
  UserPlus, 
  Repeat, 
  Headset, 
  Settings,
  ChevronLeft
} from 'lucide-react'

export default function ActionsHub() {
  const router = useRouter()

  return (
    <main className="min-h-screen pb-32 bg-background">
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A] active:scale-90 transition-all border border-gray-100"
          >
            <ChevronLeft size={22} />
          </button>
          <NexLogo />
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={24} className="text-foreground" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">3</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full border-[1.5px] border-gray-300 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mb-4 text-left overflow-hidden">
          <h1 className="text-nex-h2 font-bold text-foreground leading-tight mb-1">What would you like to do?</h1>
          <p className="text-nex-sub text-gray-500 font-medium select-none">
            Quick Start
          </p>
        </div>
      </header>

      <div className="px-4 mb-8">
        <div className="w-full bg-gradient-to-r from-[#005F56] to-[#0D9B85] rounded-nex-md p-[20px] flex items-center justify-between overflow-hidden shadow-lg">
          <div className="flex-1">
            <div className="inline-flex items-center bg-white/20 text-white text-nex-xs px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
              ✦ All Services
            </div>
            <h2 className="text-nex-h2 font-bold text-white leading-tight mb-1">
              More ways to<br />manage & grow
            </h2>
            <p className="text-white/75 text-nex-caption leading-snug mb-4">
              Send, pay, invest and grow your money seamlessly.
            </p>
          </div>

          <div className="relative w-[90px] h-[90px] grid grid-cols-3 gap-[3px] shrink-0 ml-4">
            {[
              '#FFFFFF20', '#FFFFFF30', '#1DB89A',
              '#FFFFFF15', '#005F56', '#FFFFFF25',
              '#1DB89A', '#FFFFFF20', '#FFFFFF30'
            ].map((color, i) => (
              <div 
                key={i} 
                className="w-[26px] h-[26px] rounded-[6px]" 
                style={{ backgroundColor: color }} 
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-9 h-9 text-white">
                  <NexLogo iconOnly className="w-full h-full brightness-0 invert" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 mb-6">
        <h3 className="text-nex-body font-bold text-foreground mb-4">Send & Receive</h3>
        <Card className="bg-white border-none rounded-nex-sm p-4 shadow-nex-soft">
          <div className="grid grid-cols-4 gap-2">
            <ActionTile onClick={() => router.push('/send-money')} icon={<Send size={28} />} iconColor="text-accent" title="Send Money" subtitle="Send money to anyone instantly" />
            <ActionTile icon={<Download size={28} />} iconColor="text-accent" title="Receive Money" subtitle="Receive money from anyone" />
            <ActionTile onClick={() => router.push('/scan-pay')} icon={<QrCode size={28} />} iconColor="text-accent" title="Scan & Pay" subtitle="Scan QR code to pay" />
            <ActionTile icon={<Target size={28} />} iconColor="text-accent" title="Request Money" subtitle="Request money from others" />
          </div>
        </Card>
      </section>

      <section className="px-4 mb-6">
        <h3 className="text-nex-body font-bold text-foreground mb-4">Pay & Recharge</h3>
        <Card className="bg-white border-none rounded-nex-sm p-4 shadow-nex-soft">
          <div className="grid grid-cols-4 gap-2">
            <ActionTile onClick={() => router.push('/pay-bills')} icon={<FileText size={28} />} iconColor="text-accent" title="Pay Bills" subtitle="Pay your bills seamlessly" />
            <ActionTile onClick={() => router.push('/buy-airtime')} icon={<Smartphone size={28} />} iconColor="text-accent" title="Buy Airtime" subtitle="Top up airtime instantly" />
            <ActionTile onClick={() => router.push('/buy-data')} icon={<Wifi size={28} />} iconColor="text-accent" title="Data Bundle" subtitle="Buy data bundles easily" />
            <ActionTile onClick={() => router.push('/pay-bills')} icon={<Zap size={28} />} iconColor="text-accent" title="Electricity" subtitle="Pay for electricity bills" />
          </div>
        </Card>
      </section>

      <section className="px-4 mb-6">
        <h3 className="text-nex-body font-bold text-foreground mb-4">Invest & Grow</h3>
        <Card className="bg-white border-none rounded-nex-sm p-4 shadow-nex-soft">
          <div className="grid grid-cols-4 gap-2">
            <ActionTile icon={<Target size={28} />} iconColor="text-primary" title="Investments" subtitle="Grow your wealth" />
            <ActionTile icon={<Coins size={28} />} iconColor="text-primary" title="Savings" subtitle="Save and earn interest" />
            <ActionTile icon={<Lock size={28} />} iconColor="text-primary" title="NexVault" subtitle="Lock funds securely" />
            <ActionTile icon={<Umbrella size={28} />} iconColor="text-primary" title="Insurance" subtitle="Protect your assets" />
          </div>
        </Card>
      </section>

      <section className="px-4 mb-8">
        <h3 className="text-nex-body font-bold text-foreground mb-4">More Services</h3>
        <Card className="bg-white border-none rounded-nex-sm p-4 shadow-nex-soft">
          <div className="grid grid-cols-4 gap-2">
            <InviteDialog trigger={
              <button className="flex flex-col items-center text-center gap-1.5 p-1 active:scale-95 transition-transform group">
                <div className="mb-1 group-hover:scale-110 transition-transform text-primary">
                  <UserPlus size={28} />
                </div>
                <span className="text-nex-caption font-bold text-foreground leading-tight">Refer & Earn</span>
              </button>
            } />
            <ActionTile onClick={() => router.push('/transactions')} icon={<Repeat size={28} />} iconColor="text-primary" title="Transactions" subtitle="View all your transactions" />
            <ActionTile onClick={() => router.push('/support')} icon={<Headset size={28} />} iconColor="text-primary" title="Support" subtitle="Get help whenever" />
            <ActionTile onClick={() => router.push('/profile')} icon={<Settings size={28} />} iconColor="text-primary" title="Settings" subtitle="Manage account" />
          </div>
        </Card>
      </section>

      <BottomNav />
    </main>
  )
}

function ActionTile({ icon, iconColor, title, subtitle, onClick }: { icon: React.ReactNode, iconColor: string, title: string, subtitle: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center text-center gap-1.5 p-1 active:scale-95 transition-transform group"
    >
      <div className={cn("mb-1 group-hover:scale-110 transition-transform", iconColor)}>
        {icon}
      </div>
      <span className="text-nex-caption font-bold text-foreground leading-tight">{title}</span>
    </button>
  )
}
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  ShieldCheck, 
  Copy, 
  ChevronRight, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  Award, 
  SlidersHorizontal, 
  Globe, 
  Headset, 
  LogOut,
  Camera,
  AlertCircle,
  Bell,
  CreditCard,
  Target,
  FileText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useUser, useDoc } from '@/firebase'
import { NexLogo } from '@/components/ui/NexLogo'
import { BottomNav } from '@/components/layout/BottomNav'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function ProfileScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  
  const { data: profile, loading: profileLoading } = useDoc<any>(user ? { table: 'users', id: user.uid } : null)
  
  const [biometrics, setBiometrics] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Account number copied." })
  }

  const MENU_SECTIONS = [
    {
      title: "Settings",
      items: [
        { icon: <ShieldCheck />, title: "KYC Verification", sub: "Level 2 • Verified", color: "text-emerald-500" },
        { icon: <CreditCard />, title: "Payment Methods", sub: "2 Banks Linked", color: "text-primary" },
      ]
    },
    {
      title: "Security",
      items: [
        { icon: <Lock />, title: "Transaction PIN", sub: "Change secure PIN", color: "text-accent" },
        { icon: <Smartphone />, title: "Two-Factor Auth", sub: "Active", color: "text-primary" },
      ]
    }
  ]

  return (
    <main className="min-h-screen pb-40 bg-[#F8FAF9] overflow-x-hidden">
      <header className="px-4 sm:px-6 pt-10 pb-6 bg-white sticky top-0 z-40 border-b border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <NexLogo />
          <div className="flex items-center gap-3">
             <button className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A1A]">
                <Bell size={20} />
             </button>
             <button className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-primary">
                <SlidersHorizontal size={20} />
             </button>
          </div>
        </div>
        <h1 className="text-[24px] font-bold text-slate-900 tracking-tight px-1">Profile</h1>
      </header>

      <div className="px-4 sm:px-6 py-8 space-y-6 max-w-screen-md mx-auto">
        <Card className="p-8 border-none shadow-nex-soft rounded-[40px] bg-white relative overflow-hidden text-center">
          <div className="relative mb-4 mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-[36px] bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-300" />
            )}
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center border-2 border-white shadow-lg">
              <Camera size={14} />
            </button>
          </div>
          
          <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
            {profileLoading ? <Skeleton className="h-7 w-40 mx-auto" /> : profile?.displayName || 'Elite Member'}
          </h2>
          <p className="text-[14px] text-gray-500 font-medium mb-4">{profile?.email || 'member@nexmonie.com'}</p>
          
          <div className="flex items-center justify-center gap-2">
             <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black uppercase py-1 px-3 rounded-full">
                <Award size={12} className="inline mr-1" /> {profile?.tier || 'Elite'} Member
             </Badge>
          </div>
        </Card>

        {MENU_SECTIONS.map((section, idx) => (
          <section key={idx} className="space-y-3">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">{section.title}</label>
             <Card className="overflow-hidden border-none shadow-nex-soft rounded-[32px] bg-white divide-y divide-gray-50">
                {section.items.map((item, i) => (
                  <ProfileOption key={i} icon={item.icon} title={item.title} subtitle={item.sub} color={item.color} />
                ))}
             </Card>
          </section>
        ))}

        <Card className="overflow-hidden border-none shadow-nex-soft rounded-[32px] bg-white divide-y divide-gray-50">
          <div className="flex items-center justify-between p-5 px-6">
            <span className="text-[15px] font-bold text-slate-700">Push Notifications</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between p-5 px-6">
            <span className="text-[15px] font-bold text-slate-700">Biometric Login</span>
            <Switch checked={biometrics} onCheckedChange={setBiometrics} />
          </div>
        </Card>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogTrigger asChild>
            <button className="w-full py-5 bg-white border border-gray-100 text-accent font-bold rounded-[22px] flex items-center justify-center gap-3">
              <LogOut size={20} />
              Sign Out Securely
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[92vw] sm:max-w-md rounded-[40px] p-8 text-center border-none bg-white">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-[24px] font-bold text-slate-900">Exit Secure Session?</DialogTitle>
              <DialogDescription className="text-gray-500 text-[15px] mt-2">
                You'll need to re-authenticate to access your financial command center.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <button onClick={() => router.push('/')} className="w-full py-5 bg-accent text-white font-bold rounded-[22px] shadow-lg shadow-accent/20">Yes, Log Me Out</button>
              <button onClick={() => setLogoutOpen(false)} className="w-full py-5 bg-gray-50 text-slate-700 font-bold rounded-[22px]">Cancel</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </main>
  )
}

function ProfileOption({ icon, title, subtitle, color }: any) {
  return (
    <button className="w-full p-5 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50", color)}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <div className="text-left">
          <span className="text-[15px] font-bold text-slate-700 block">{title}</span>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-all" />
    </button>
  )
}

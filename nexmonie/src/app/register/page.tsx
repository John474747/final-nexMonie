"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { NexLogo } from '@/components/ui/NexLogo'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [stage, setStage] = useState<'form' | 'success'>('form')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.displayName || !form.email || !form.password) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Fill in all required fields.' })
      return
    }
    if (form.password !== form.confirm) {
      toast({ variant: 'destructive', title: 'Password mismatch', description: 'Passwords do not match.' })
      return
    }
    if (form.password.length < 8) {
      toast({ variant: 'destructive', title: 'Weak password', description: 'Use at least 8 characters.' })
      return
    }

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth!, form.email.trim(), form.password)
      await updateProfile(cred.user, { displayName: form.displayName.trim() })

      // Create user profile + wallet in Firestore
      const uid = cred.user.uid
      await Promise.all([
        setDoc(doc(db!, 'users', uid), {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phone.trim(),
          tier: 'nex Basic',
          isVerified: false,
          status: 'active',
          role: 'user',
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        setDoc(doc(db!, 'wallets', uid), {
          userId: uid,
          available: 0,
          savings: 0,
          investments: 0,
          vault: 0,
          lastUpdated: serverTimestamp(),
        }),
      ])

      setStage('success')
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.message || 'Registration failed.'
      toast({ variant: 'destructive', title: 'Registration Failed', description: msg })
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'success') {
    return (
      <main className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="w-24 h-24 bg-[#005F56]/10 rounded-[32px] flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} className="text-[#005F56]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#1A1A1A]">Account Created!</h1>
            <p className="text-[14px] text-gray-400 mt-2">Welcome to nex Monie, {form.displayName.split(' ')[0]}.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full h-14 bg-[#005F56] text-white font-bold rounded-2xl shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center px-6 py-12 pb-safe">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005F56] via-[#1B816B] to-[#FF6B6B]" />

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <NexLogo />
          <p className="text-[13px] text-gray-400 font-medium">Join Nigeria's smartest finance app</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_40px_rgba(0,95,86,0.08)] space-y-5">
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Create Account</h1>
            <p className="text-[13px] text-gray-400 mt-1">It takes 30 seconds</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
              <Input
                type="text"
                placeholder="Chukwuma Ogbonna"
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
                className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
              <Input
                type="tel"
                placeholder="08012345678"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5 pr-14"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#005F56] text-white font-bold rounded-2xl shadow-lg shadow-[#005F56]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create My Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-400">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="font-bold text-[#005F56]">Sign In</button>
        </p>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-300">
          <Shield size={12} />
          <span>256-bit encrypted · Bank-grade security</span>
        </div>
      </div>
    </main>
  )
}

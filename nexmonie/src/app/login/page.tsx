"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import { NexLogo } from '@/components/ui/NexLogo'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Enter your email and password.' })
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth!, email.trim(), password)
      // Founder redirect
      const founderEmails = ['www.henryhart23@gmail.com', 'atuchukwuarinze742@gmail.com']
      if (founderEmails.includes(email.trim().toLowerCase())) {
        router.push('/founder')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : err.message || 'Login failed.'
      toast({ variant: 'destructive', title: 'Login Failed', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center px-6 pb-safe">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005F56] via-[#1B816B] to-[#FF6B6B]" />

      <div className="w-full max-w-sm space-y-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <NexLogo />
          <p className="text-[13px] text-gray-400 font-medium tracking-wide">Your financial command center</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_40px_rgba(0,95,86,0.08)] space-y-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Welcome back</h1>
            <p className="text-[13px] text-gray-400 mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-14 rounded-2xl bg-gray-50 border-none font-medium text-[15px] px-5 pr-14"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#005F56] text-white font-bold rounded-2xl shadow-lg shadow-[#005F56]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-gray-400">
          New to nex Monie?{' '}
          <button
            onClick={() => router.push('/register')}
            className="font-bold text-[#005F56]"
          >
            Create Account
          </button>
        </p>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-300">
          <Shield size={12} />
          <span>256-bit encrypted · Bank-grade security</span>
        </div>
      </div>
    </main>
  )
}

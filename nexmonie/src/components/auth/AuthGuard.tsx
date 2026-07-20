"use client"

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/firebase'
import { Loader2 } from 'lucide-react'
import { NexLogo } from '@/components/ui/NexLogo'

const PUBLIC_ROUTES = ['/login', '/register']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
    if (!user && !isPublic) {
      router.replace('/login')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-6">
          <NexLogo className="animate-pulse" />
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm">
            <Loader2 size={14} className="animate-spin text-[#005F56]" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Authenticating...</span>
          </div>
        </div>
      </div>
    )
  }

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  if (!user && !isPublic) return null

  return <>{children}</>
}

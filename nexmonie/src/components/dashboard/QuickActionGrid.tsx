"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  FileText, 
  Smartphone, 
  Wifi, 
  QrCode, 
  ArrowDownCircle, 
  Repeat, 
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Metadata-driven Quick Actions.
 * Architecture: UI consumes from a predefined schema.
 */
const ACTIONS = [
  { id: 'send', icon: <Send size={22} />, label: "Send Money", iconColor: "text-accent", path: "/send-money", isFeatured: true },
  { id: 'bills', icon: <FileText size={22} />, label: "Pay Bills", iconColor: "text-accent", path: "/pay-bills" },
  { id: 'airtime', icon: <Smartphone size={22} />, label: "Buy Airtime", iconColor: "text-accent", path: "/buy-airtime" },
  { id: 'data', icon: <Wifi size={22} />, label: "Data Bundle", iconColor: "text-accent", path: "/buy-data" },
  { id: 'scan', icon: <QrCode size={22} />, label: "Scan & Pay", iconColor: "text-accent", path: "/scan-pay", isNew: true },
  { id: 'request', icon: <ArrowDownCircle size={22} />, label: "Request", iconColor: "text-accent", path: "/actions-hub" },
  { id: 'transactions', icon: <Repeat size={22} />, label: "History", iconColor: "text-accent", path: "/transactions" },
  { id: 'refer', icon: <UserPlus size={22} />, label: "Refer", iconColor: "text-accent", path: "/actions-hub" },
]

export function QuickActionGrid() {
  const router = useRouter()
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const isDragging = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !isDragging.current) return
    const currentX = e.targetTouches[0].clientX
    const diff = currentX - touchStartX
    
    // Swipe Right (diff > 0) only
    if (diff > 0) {
      setOffsetX(Math.min(diff, 100)) // Cap the drag visual
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const distance = touchEndX - touchStartX

    isDragging.current = false

    if (distance > 150) {
      setOffsetX(window.innerWidth)
      setTimeout(() => {
        router.push('/utilities-hub')
      }, 250)
    } else {
      setOffsetX(0)
    }
    setTouchStartX(null)
  }

  return (
    <div 
      className="px-4 sm:px-6 mb-6 sm:mb-8 relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[15px] sm:text-[17px] font-bold text-foreground tracking-tight">Quick Actions</h2>
        <button 
          onClick={() => router.push('/actions-hub')}
          className="text-[11px] sm:text-[13px] font-bold text-primary active:opacity-60 transition-opacity"
        >
          View All
        </button>
      </div>

      <div 
        className={cn(
          "grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4 will-change-transform",
          !isDragging.current && "transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1)"
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        {ACTIONS.map((action) => (
          <button 
            key={action.id} 
            onClick={() => router.push(action.path)}
            className="flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-0.5 rounded-[16px] sm:rounded-[24px] bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 group relative"
          >
            {action.isNew && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            )}
            <div className={cn("transition-transform group-hover:scale-110", action.iconColor)}>
              {React.cloneElement(action.icon as React.ReactElement, { 
                className: "w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" 
              })}
            </div>
            <span className="text-[8px] sm:text-[10px] font-bold text-foreground leading-tight text-center truncate w-full px-1">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

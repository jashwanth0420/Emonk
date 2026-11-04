'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface PillTabItem {
  href: string
  label: string
}

interface PillTabsBarProps {
  tabs: PillTabItem[]
  className?: string
}

export function PillTabsBar({ tabs, className = '' }: PillTabsBarProps) {
  const pathname = usePathname()

  return (
    <div className={`w-full max-w-full overflow-x-auto no-scrollbar py-1 touch-pan-x ${className}`}>
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {tabs.map((tab) => {
          const isExactActive = pathname === tab.href
          const isSubActive = 
            tab.href !== '/admin/dashboard' && 
            tab.href !== '/student/dashboard' && 
            tab.href !== '/tutor/dashboard' && 
            pathname.startsWith(tab.href)
          const isActive = isExactActive || isSubActive

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-4 py-2 sm:px-5 sm:py-2 text-xs font-semibold tracking-tight transition-all shadow-xs shrink-0 select-none ${
                isActive
                  ? 'bg-[#111215] text-white shadow-sm'
                  : 'bg-white text-[#2B2D31] hover:bg-[#F8F9FA] border border-black/[0.06] hover:border-black/15'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

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
    <div className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
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
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-tight transition-all shadow-sm ${
                isActive
                  ? 'bg-[#111215] text-white shadow'
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

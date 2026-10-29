'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

interface SidebarNavProps {
  groups: NavGroup[]
}

export function SidebarNav({ groups }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-surface p-4 hidden md:flex flex-col h-full shrink-0">
      <nav className="space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/student/dashboard' && item.href !== '/tutor/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FFF1E6] text-[#F97316] dark:bg-[#2A1C12] dark:text-[#F97316]'
                        : 'text-muted hover:text-text hover:bg-[#F5F5F3] dark:hover:bg-[#27272A]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#F97316]' : 'text-muted'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

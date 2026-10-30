'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserSquare,
  Calendar,
  BookOpen,
  HelpCircle,
  Brain,
  BarChart3,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  Rss,
  User,
  LogOut,
  Sparkles,
  Rocket,
  LucideIcon
} from 'lucide-react'
import { logoutAction } from '@/app/(auth)/login/actions'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserSquare,
  Calendar,
  BookOpen,
  HelpCircle,
  Brain,
  BarChart3,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  Rss,
  User,
  Sparkles,
  Rocket
}

export interface RailNavItem {
  href: string
  label: string
  iconName: string
}

interface AppSidebarRailProps {
  items: RailNavItem[]
  userRole?: string
}

export function AppSidebarRail({ items, userRole }: AppSidebarRailProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Left Slim Dark Dock */}
      <aside className="hidden md:flex flex-col w-[72px] shrink-0 h-screen sticky top-0 bg-[#111215] border-r border-[#1E2024] py-5 px-2.5 z-40 select-none">
        {/* Top Logo Mark with Sparkle */}
        <Link
          href={items[0]?.href || '/'}
          className="w-12 h-12 rounded-[18px] bg-[#18191D] border border-[#2B2D33] flex items-center justify-center text-white shadow-sm mb-6 mx-auto hover:border-white/40 transition-colors group"
          title="Emonk Attendance"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-lg font-bold tracking-tighter">✦</span>
          </div>
        </Link>

        {/* Center Navigation Icons Stack */}
        <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar py-2">
          {items.map((item) => {
            const Icon = ICON_MAP[item.iconName] || LayoutDashboard
            const isExactActive = pathname === item.href
            const isSubActive = item.href !== '/admin/dashboard' && 
                                item.href !== '/student/dashboard' && 
                                item.href !== '/tutor/dashboard' && 
                                pathname.startsWith(item.href)
            const isActive = isExactActive || isSubActive

            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#24262B] text-white shadow-sm'
                      : 'text-[#7A7E86] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </Link>

                {/* Floating Tooltip */}
                <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
                  <div className="bg-[#18191D] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* Bottom Utility Icons */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-4 border-t border-[#1E2024]">
          <Link
            href="/admin/posts"
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-[#7A7E86] hover:text-white hover:bg-white/5 transition-all group relative"
            title="Updates & Guides"
          >
            <BookOpen className="w-4 h-4" />
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
              <div className="bg-[#18191D] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap">
                Resources
              </div>
            </div>
          </Link>

          <Link
            href="/admin/ai"
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-[#7A7E86] hover:text-[#EBFD78] hover:bg-white/5 transition-all group relative"
            title="AI Innovation"
          >
            <Rocket className="w-4 h-4" />
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
              <div className="bg-[#18191D] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap">
                AI Engine
              </div>
            </div>
          </Link>

          {/* Logout Action */}
          <form action={logoutAction} className="w-full flex justify-center">
            <button
              type="submit"
              className="w-11 h-11 rounded-[16px] flex items-center justify-center text-[#7A7E86] hover:text-red-400 hover:bg-red-500/10 transition-all group relative"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
                <div className="bg-[#18191D] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap">
                  Logout ({userRole || 'User'})
                </div>
              </div>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-[#111215]/95 backdrop-blur-md border-t border-[#1E2024] flex items-center justify-around px-2 z-50 md:hidden">
        {items.slice(0, 5).map((item) => {
          const Icon = ICON_MAP[item.iconName] || LayoutDashboard
          const isExactActive = pathname === item.href
          const isSubActive = item.href !== '/admin/dashboard' && 
                              item.href !== '/student/dashboard' && 
                              item.href !== '/tutor/dashboard' && 
                              pathname.startsWith(item.href)
          const isActive = isExactActive || isSubActive

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-[#EBFD78] bg-[#24262B]' : 'text-[#7A7E86]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[56px]">{item.label}</span>
            </Link>
          )
        })}

        {/* Mobile Logout / Menu */}
        <form action={logoutAction} className="flex flex-col items-center justify-center">
          <button
            type="submit"
            className="flex flex-col items-center justify-center p-2 rounded-xl text-[#7A7E86] hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Exit</span>
          </button>
        </form>
      </div>
    </>
  )
}

import { SidebarNav, NavGroup } from '@/components/layout/SidebarNav'
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  Rss,
  User
} from 'lucide-react'

const studentNavGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/student/attendance', label: 'Attendance Check-in', icon: CheckSquare },
      { href: '/student/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/student/progress', label: 'Progress & Topics', icon: TrendingUp },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/student/feed', label: 'Central Feed', icon: Rss },
      { href: '/student/profile', label: 'My Profile', icon: User },
    ],
  },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <SidebarNav groups={studentNavGroups} />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {children}
      </main>
    </div>
  )
}

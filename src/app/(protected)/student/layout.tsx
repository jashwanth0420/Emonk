import { SidebarNav, NavGroup } from '@/components/layout/SidebarNav'

const studentNavGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { href: '/student/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
      { href: '/student/attendance', label: 'Attendance Check-in', iconName: 'CheckSquare' },
      { href: '/student/calendar', label: 'Calendar', iconName: 'CalendarDays' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/student/progress', label: 'Progress & Topics', iconName: 'TrendingUp' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/student/feed', label: 'Central Feed', iconName: 'Rss' },
      { href: '/student/profile', label: 'My Profile', iconName: 'User' },
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

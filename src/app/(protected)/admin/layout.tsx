import { SidebarNav, NavGroup } from '@/components/layout/SidebarNav'

const adminNavGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
      { href: '/admin/students', label: 'Students', iconName: 'Users' },
      { href: '/admin/tutors', label: 'Tutors', iconName: 'UserSquare' },
      { href: '/admin/schedules', label: 'Schedules', iconName: 'Calendar' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/admin/topics', label: 'Topics', iconName: 'BookOpen' },
      { href: '/admin/questions', label: 'Question Bank', iconName: 'HelpCircle' },
      { href: '/admin/ai', label: 'AI Generator', iconName: 'Brain' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', iconName: 'BarChart3' },
      { href: '/admin/posts', label: 'Posts & Feed', iconName: 'MessageSquare' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <SidebarNav groups={adminNavGroups} />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {children}
      </main>
    </div>
  )
}

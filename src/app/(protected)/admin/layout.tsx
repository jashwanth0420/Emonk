import { SidebarNav, NavGroup } from '@/components/layout/SidebarNav'
import {
  LayoutDashboard,
  Users,
  UserSquare,
  Calendar,
  BookOpen,
  HelpCircle,
  Brain,
  BarChart3,
  MessageSquare
} from 'lucide-react'

const adminNavGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/students', label: 'Students', icon: Users },
      { href: '/admin/tutors', label: 'Tutors', icon: UserSquare },
      { href: '/admin/schedules', label: 'Schedules', icon: Calendar },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/admin/topics', label: 'Topics', icon: BookOpen },
      { href: '/admin/questions', label: 'Question Bank', icon: HelpCircle },
      { href: '/admin/ai', label: 'AI Generator', icon: Brain },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/posts', label: 'Posts & Feed', icon: MessageSquare },
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

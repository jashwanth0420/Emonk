import { SidebarNav, NavGroup } from '@/components/layout/SidebarNav'
import {
  LayoutDashboard,
  Users,
  CheckSquare
} from 'lucide-react'

const tutorNavGroups: NavGroup[] = [
  {
    label: 'Manage',
    items: [
      { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/tutor/students', label: 'My Students', icon: Users },
      { href: '/tutor/attendance', label: 'Pending Reviews', icon: CheckSquare },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/tutor/attendance', label: 'Review Submissions', icon: CheckSquare },
    ],
  },
]

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <SidebarNav groups={tutorNavGroups} />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {children}
      </main>
    </div>
  )
}

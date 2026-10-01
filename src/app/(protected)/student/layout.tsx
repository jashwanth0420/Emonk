import Link from 'next/link'
import { LayoutDashboard, CheckSquare, CalendarDays, TrendingUp, User, Rss } from 'lucide-react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-background p-4 hidden md:block">
        <nav className="space-y-2">
          <Link href="/student/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/student/attendance" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <CheckSquare className="h-4 w-4" />
            Attendance
          </Link>
          <Link href="/student/calendar" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Link>
          <Link href="/student/progress" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <TrendingUp className="h-4 w-4" />
            Progress
          </Link>
          <Link href="/student/feed" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <Rss className="h-4 w-4" />
            Feed
          </Link>
          <Link href="/student/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}

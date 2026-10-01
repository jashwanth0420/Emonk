import Link from 'next/link'
import { Users, UserSquare, Calendar, BookOpen, HelpCircle, LayoutDashboard, BarChart3, MessageSquare, Brain } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-background p-4 hidden md:block">
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin/students" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <Users className="h-4 w-4" />
            Students
          </Link>
          <Link href="/admin/tutors" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <UserSquare className="h-4 w-4" />
            Tutors
          </Link>
          <Link href="/admin/schedules" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <Calendar className="h-4 w-4" />
            Schedules
          </Link>
          <Link href="/admin/topics" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <BookOpen className="h-4 w-4" />
            Topics
          </Link>
          <Link href="/admin/questions" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <HelpCircle className="h-4 w-4" />
            Question Bank
          </Link>
          <Link href="/admin/ai" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <Brain className="h-4 w-4" />
            AI Generator
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link href="/admin/posts" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <MessageSquare className="h-4 w-4" />
            Posts
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}

import Link from 'next/link'
import { LayoutDashboard, Users, CheckSquare } from 'lucide-react'

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-background p-4 hidden md:block">
        <nav className="space-y-2">
          <Link href="/tutor/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/tutor/students" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <Users className="h-4 w-4" />
            My Students
          </Link>
          <Link href="/tutor/attendance" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium">
            <CheckSquare className="h-4 w-4" />
            Pending Reviews
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}

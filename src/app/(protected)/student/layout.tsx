import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, CheckSquare, CalendarDays, TrendingUp, User } from 'lucide-react'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  const role = profile?.role || 'student'
  
  if (role !== 'student') {
    redirect(`/${role}/dashboard`)
  }

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

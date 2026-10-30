import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logoutAction } from '@/app/(auth)/login/actions'
import { AppSidebarRail, RailNavItem } from '@/components/layout/AppSidebarRail'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'student'
  const isAdmin = role === 'super_admin' || role === 'admin'
  const isTutor = role === 'tutor'

  let railItems: RailNavItem[] = []

  if (isAdmin) {
    railItems = [
      { href: '/admin/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
      { href: '/admin/students', label: 'Students', iconName: 'Users' },
      { href: '/admin/tutors', label: 'Tutors', iconName: 'UserSquare' },
      { href: '/admin/schedules', label: 'Schedules', iconName: 'Calendar' },
      { href: '/admin/questions', label: 'Questions', iconName: 'HelpCircle' },
      { href: '/admin/analytics', label: 'Analytics', iconName: 'BarChart3' },
    ]
  } else if (isTutor) {
    railItems = [
      { href: '/tutor/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
      { href: '/tutor/students', label: 'Students', iconName: 'Users' },
      { href: '/tutor/attendance', label: 'Reviews', iconName: 'CheckSquare' },
    ]
  } else {
    railItems = [
      { href: '/student/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
      { href: '/student/attendance', label: 'Attendance', iconName: 'CheckSquare' },
      { href: '/student/calendar', label: 'Calendar', iconName: 'CalendarDays' },
      { href: '/student/progress', label: 'Progress', iconName: 'TrendingUp' },
      { href: '/student/feed', label: 'Feed', iconName: 'Rss' },
      { href: '/student/profile', label: 'Profile', iconName: 'User' },
    ]
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] text-[#111215] antialiased w-full max-w-full overflow-x-hidden">
      {/* Slim Dark Dock (lg:flex) & Bottom Bar (lg:hidden) */}
      <AppSidebarRail items={railItems} userRole={role} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Mobile / Tablet Header Bar (< 1024px) */}
        <header className="lg:hidden flex h-14 items-center justify-between border-b border-black/[0.06] px-4 bg-white sticky top-0 z-30 shrink-0 w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#111215] flex items-center justify-center text-white text-xs font-bold">
              ✦
            </div>
            <span className="font-bold text-base tracking-tight text-[#111215]">
              Emonk
            </span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111215]">
              {role.replace('_', ' ')}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-semibold text-[#7A7E86] hover:text-[#111215] px-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </form>
        </header>

        {/* Scrollable Viewport with Bottom Padding for Mobile Nav */}
        <main className="flex-1 w-full max-w-full pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}

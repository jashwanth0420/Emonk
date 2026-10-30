import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import Link from 'next/link'
import { Users, CheckSquare, ArrowRight, UserCheck } from 'lucide-react'

const tutorPillTabs = [
  { href: '/tutor/dashboard', label: 'Overview' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/attendance', label: 'Review Submissions' },
]

export default async function TutorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name, role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

  // Get assigned students
  let assignedStudentIds: string[] = []
  if (user) {
    const { data: assignments } = await adminClient
      .from('tutor_student_assignments')
      .select('student_id')
      .eq('tutor_id', user.id)
      .eq('status', 'active')
    assignedStudentIds = assignments?.map(a => a.student_id) || []
  }

  // Pending reviews count
  let pendingQuery = adminClient
    .from('attendance')
    .select('id, attendance_date, profiles:student_id(full_name), schedules(title)')
    .eq('status', 'pending_review')
    .order('attendance_date', { ascending: false })

  if (!isAdmin) {
    pendingQuery = pendingQuery.in('student_id', assignedStudentIds.length > 0 ? assignedStudentIds : ['00000000-0000-0000-0000-000000000000'])
  }

  const { data: pendingReviews } = await pendingQuery.limit(5)
  const pendingCount = pendingReviews?.length || 0

  // Approved count
  const approvedQuery = adminClient
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('approved_by', user?.id)

  const { count: approvedCount } = await approvedQuery

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Playful Headline with Inline Badges */}
      <DesignPageHeader
        firstLinePrefix="Mentoring"
        firstLinePillIcon={UserCheck}
        firstLineSuffix="Your Students"
        secondLinePrefix="and"
        secondLineSuffix="Submissions"
        actionLabel="Review Attendance"
        actionHref="/tutor/attendance"
        settingsHref="/tutor/dashboard"
      />

      {/* Horizontal Pill Tabs Bar */}
      <PillTabsBar tabs={tutorPillTabs} className="mb-2" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737780]">Assigned Students</span>
            <Users className="w-4 h-4 text-[#111315]" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {assignedStudentIds.length}
          </div>
        </div>

        <div className="bg-[#EBFD78] rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-[#111315]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111315]/80">Pending Reviews</span>
            <CheckSquare className="w-4 h-4 text-[#111315]" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737780]">Approved by You</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {approvedCount || 0}
          </div>
        </div>
      </div>

      {/* Pending Reviews Table Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base text-[#111315]">Pending Concept Submissions</h3>
            <p className="text-xs text-[#737780] mt-0.5">Students awaiting your evaluation and attendance sign-off</p>
          </div>
          <Link href="/tutor/attendance" className="text-xs font-semibold text-[#111315] hover:opacity-75 flex items-center gap-1">
            Review All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {pendingReviews?.map((rec: any) => (
            <div key={rec.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/[0.04] text-xs">
              <div>
                <p className="font-bold text-sm text-[#111315]">{rec.profiles?.full_name || 'Student'}</p>
                <p className="text-[#737780] text-[11px] mt-0.5">
                  {rec.schedules?.title} • {new Date(rec.attendance_date).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/tutor/attendance#review-${rec.id}`}
                className="px-4 py-1.5 rounded-full bg-[#111215] text-white hover:bg-black font-semibold text-[11px] transition-all shadow-sm"
              >
                Evaluate Answer
              </Link>
            </div>
          ))}
          {(!pendingReviews || pendingReviews.length === 0) && (
            <div className="text-center py-8 text-[#737780] text-xs">
              No pending reviews! All assigned student submissions have been evaluated.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { BentoDashboard } from '@/components/dashboard/BentoDashboard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const adminPillTabs = [
  { href: '/admin/dashboard', label: 'Organization' },
  { href: '/admin/students', label: 'Teams' },
  { href: '/admin/tutors', label: 'Users' },
  { href: '/admin/schedules', label: 'Subscription' },
  { href: '/admin/topics', label: 'Payment' },
  { href: '/admin/questions', label: 'Installed Apps' },
  { href: '/admin/ai', label: 'Variables' },
  { href: '/admin/analytics', label: 'Scenario Properties' },
]

export default async function AdminDashboard() {
  const adminClient = createAdminClient()

  // Real-time metrics
  const [
    { count: studentCount },
    { count: tutorCount },
    { count: topicCount },
    { count: scheduleCount },
    { count: questionCount },
    { count: pendingReviewCount },
    { data: recentAttendance },
    { data: upcomingSchedules }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    adminClient.from('topics').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('schedules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    adminClient.from('attendance')
      .select('id, attendance_date, status, profiles:student_id(full_name), schedules(title)')
      .order('attendance_date', { ascending: false })
      .limit(5),
    adminClient.from('schedules')
      .select('id, title, date, start_time, end_time, topics(name)')
      .order('date', { ascending: false })
      .limit(3)
  ])

  const stats = {
    studentCount: studentCount || 0,
    tutorCount: tutorCount || 0,
    topicCount: topicCount || 0,
    scheduleCount: scheduleCount || 0,
    questionCount: questionCount || 0,
    pendingReviewCount: pendingReviewCount || 0,
    recentAttendance: recentAttendance || [],
    upcomingSchedules: upcomingSchedules || [],
  }

  return (
    <div className="space-y-6">
      {/* Top Playful Headline with Inline Badges matching Reference UI */}
      <DesignPageHeader
        firstLinePrefix="Managing"
        firstLineSuffix="Your Team"
        secondLinePrefix="and"
        secondLineSuffix="Workflows"
        actionLabel="+ Create a New Scenario"
        actionHref="/admin/schedules"
        settingsHref="/admin/analytics"
      />

      {/* Horizontal Pill Tabs Bar matching Reference UI */}
      <PillTabsBar tabs={adminPillTabs} className="mb-2" />

      {/* Main Bento Grid matching Reference UI */}
      <BentoDashboard stats={stats} />

      {/* Live Operational Feeds Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Recent Attendance Submissions */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-[#111315] tracking-tight">Recent Attendance Records</h3>
              <p className="text-xs text-[#737780] mt-0.5">Latest student check-in submissions</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-[#111315] hover:opacity-75 flex items-center gap-1 transition-opacity"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAttendance?.map((rec: any) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/[0.04] text-xs transition-colors hover:bg-gray-100/70"
              >
                <div>
                  <p className="font-bold text-sm text-[#111315]">{rec.profiles?.full_name || 'Student'}</p>
                  <p className="text-[#737780] text-[11px] mt-0.5">
                    {rec.schedules?.title} • {new Date(rec.attendance_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rec.status === 'approved'
                      ? 'bg-[#EBFD78] text-[#111315]'
                      : rec.status === 'pending_review'
                      ? 'bg-[#111315] text-white'
                      : 'bg-gray-200 text-[#111315]'
                  }`}
                >
                  {rec.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {(!recentAttendance || recentAttendance.length === 0) && (
              <div className="text-center py-8 text-[#737780] text-xs">
                No attendance records logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Active & Upcoming Sessions */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-[#111315] tracking-tight">Active & Upcoming Sessions</h3>
              <p className="text-xs text-[#737780] mt-0.5">Scheduled learning blocks in the system</p>
            </div>
            <Link
              href="/admin/schedules"
              className="text-xs font-semibold text-[#111315] hover:opacity-75 flex items-center gap-1 transition-opacity"
            >
              All Schedules <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSchedules?.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/[0.04] text-xs transition-colors hover:bg-gray-100/70"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[#111315]">{s.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-black/[0.08] text-[10px] font-bold text-[#111315]">
                    {s.topics?.name || 'General'}
                  </span>
                </div>
                <p className="text-[#737780] text-[11px]">
                  Date: {new Date(s.date).toLocaleDateString()} | Time: {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                </p>
              </div>
            ))}
            {(!upcomingSchedules || upcomingSchedules.length === 0) && (
              <div className="text-center py-8 text-[#737780] text-xs">
                No upcoming schedules. Click &ldquo;+ Create a New Scenario&rdquo; above to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

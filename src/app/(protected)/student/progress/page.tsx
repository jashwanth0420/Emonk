import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { calculateAttendancePercentage } from '@/lib/attendance/calculation'
import { Progress } from '@/components/ui/progress'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function StudentProgressPage() {
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const adminClient = createAdminClient()

  // Concurrently fetch attendance and topics
  const [
    { data: attendance },
    { data: studentTopics }
  ] = await Promise.all([
    adminClient
      .from('attendance')
      .select('status, schedules(status)')
      .eq('student_id', userId),
    adminClient
      .from('student_topics')
      .select('topics(name)')
      .eq('student_id', userId)
  ])

  const formattedAttendance = attendance?.map(a => ({
    status: a.status,
    schedule_status: (a.schedules as any)?.status || 'active'
  })) || []

  const attendancePercent = calculateAttendancePercentage(formattedAttendance)

  const topicCounts = studentTopics?.reduce((acc: any, curr: any) => {
    const name = curr.topics?.name
    if (name) acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const topTopics = Object.entries(topicCounts || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Analyzing"
        firstLinePillIconName="TrendingUp"
        firstLineSuffix="Learning Progress"
        secondLinePrefix="and"
        secondLineSuffix="Milestones"
        actionLabel="+ Check-in Attendance"
        actionHref="/student/attendance"
        settingsHref="/student/profile"
      />

      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Attendance Rate Card */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-[#737780]">Overall Attendance Rate</span>
            <div className="text-4xl sm:text-5xl font-bold text-[#111315] mt-2">{attendancePercent}%</div>
            <p className="text-xs text-[#737780] mt-1">Based on approved learning sessions and completed submissions.</p>
          </div>
          <div className="space-y-2 pt-4">
            <Progress value={attendancePercent} className="h-3 rounded-full bg-gray-100" />
            <div className="flex justify-between text-[11px] font-semibold text-[#737780]">
              <span>Current Score</span>
              <span>Target: 85%</span>
            </div>
          </div>
        </div>

        {/* Mastered Topics Card */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-7 space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#111315]">Most Studied Topics</h3>
            <p className="text-xs text-[#737780] mt-0.5">Frequency of topics covered in your attendance reports.</p>
          </div>

          <div className="space-y-3 pt-2">
            {topTopics.map(([topicName, count]: any) => (
              <div key={topicName} className="flex justify-between items-center p-3 rounded-2xl bg-[#F9FAFB] border border-black/[0.04]">
                <span className="font-semibold text-xs text-[#111315]">{topicName}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBFD78] text-[#111315]">
                  {count} {count === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            ))}
            {topTopics.length === 0 && (
              <div className="text-center py-8 text-[#737780] text-xs">
                No topic data yet. Submit daily attendance to track your curriculum milestones.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

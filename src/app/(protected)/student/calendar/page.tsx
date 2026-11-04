import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Badge } from '@/components/ui/badge'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function StudentCalendarPage() {
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const adminClient = createAdminClient()

  const { data: history } = await adminClient
    .from('attendance')
    .select('*, schedules(title, start_time, end_time, topics(name))')
    .eq('student_id', userId)
    .order('attendance_date', { ascending: false })
    .limit(30)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#EBFD78] text-[#111315] hover:bg-[#EBFD78] text-[10px] uppercase font-bold rounded-full px-3 py-1">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold rounded-full px-3 py-1">Rejected</Badge>
      case 'pending_review':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px] uppercase font-bold rounded-full px-3 py-1">Under Review</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-bold rounded-full px-3 py-1">{status.replace('_', ' ')}</Badge>
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Tracking"
        firstLinePillIconName="Calendar"
        firstLineSuffix="Session History"
        secondLinePrefix="and"
        secondLineSuffix="Timeline"
        actionLabel="+ New Check-in"
        actionHref="/student/attendance"
        settingsHref="/student/profile"
      />

      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

      <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-5 sm:p-7 space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#111315]">Recent Attendance History</h3>
          <p className="text-xs text-[#737780] mt-0.5">Logs of your verified sessions and tutor feedback for the past 30 days.</p>
        </div>

        <div className="space-y-3 pt-2">
          {history?.map((record: any) => (
            <div
              key={record.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-black/[0.04] transition-colors hover:bg-gray-100/70 gap-3"
            >
              <div className="space-y-1">
                <span className="font-bold text-sm text-[#111315]">
                  {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <p className="text-xs text-[#737780]">
                  {record.schedules?.title} &bull; {record.schedules?.topics?.name || 'General'}
                </p>
                {record.schedules?.start_time && (
                  <p className="text-[11px] font-mono text-[#737780]">
                    Time: {record.schedules.start_time.slice(0, 5)} - {record.schedules.end_time.slice(0, 5)}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                {getStatusBadge(record.status)}
                {record.tutor_feedback && (
                  <span className="text-xs text-[#737780] italic max-w-xs sm:text-right line-clamp-1" title={record.tutor_feedback}>
                    &ldquo;{record.tutor_feedback}&rdquo;
                  </span>
                )}
              </div>
            </div>
          ))}

          {(!history || history.length === 0) && (
            <div className="text-center py-12 text-[#737780] text-xs border border-dashed rounded-2xl">
              No attendance records found yet. Check into your daily sessions to build your attendance streak!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

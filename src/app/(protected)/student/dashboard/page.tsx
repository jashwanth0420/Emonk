import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { checkInAction } from '../actions'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('full_name').eq('id', user?.id).single()

  const today = new Date().toISOString().split('T')[0]

  // 1. Check for today's active schedules
  const { data: todaySchedules } = await adminClient
    .from('schedules')
    .select('*, topics(name)')
    .eq('date', today)
    .eq('status', 'active')

  // 2. Fallback to latest available active schedule if none for today
  let activeSchedule = todaySchedules?.[0]
  if (!activeSchedule) {
    const { data: anySchedules } = await adminClient
      .from('schedules')
      .select('*, topics(name)')
      .eq('status', 'active')
      .order('date', { ascending: false })
      .limit(1)
    activeSchedule = anySchedules?.[0]
  }

  // 3. Check student attendance for the active schedule
  let attendanceRecord: any = null
  if (activeSchedule && user) {
    const { data } = await adminClient
      .from('attendance')
      .select('*')
      .eq('schedule_id', activeSchedule.id)
      .eq('student_id', user.id)
      .maybeSingle()
    attendanceRecord = data
  }

  // 4. Fetch attendance history
  const { data: history } = await adminClient
    .from('attendance')
    .select('id, status, attendance_date, schedules(title, topics(name))')
    .eq('student_id', user?.id)
    .order('attendance_date', { ascending: false })
    .limit(4)

  const approvedCount = history?.filter(h => h.status === 'approved').length || 0
  const pendingCount = history?.filter(h => h.status === 'pending_review').length || 0

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Playful Headline with Inline Badges */}
      <DesignPageHeader
        firstLinePrefix={profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'Learning'}
        firstLinePillIconName="GraduationCap"
        firstLineSuffix="Your Track"
        secondLinePrefix="and"
        secondLineSuffix="Progress"
        actionLabel="+ Check-in Attendance"
        actionHref="/student/attendance"
        settingsHref="/student/profile"
      />

      {/* Horizontal Pill Tabs Bar */}
      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's / Active Session Card */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111315]">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#111315]">Current Session</h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F3F4F6] text-[#737780]">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </span>
            </div>

            <p className="text-xs text-[#737780] mb-5">
              {activeSchedule?.date === today 
                ? "Active learning session ready for check-in today" 
                : activeSchedule 
                  ? `Scheduled for ${new Date(activeSchedule.date).toLocaleDateString()}`
                  : "No scheduled sessions available"}
            </p>

            {activeSchedule ? (
              <div className="rounded-2xl border border-black/[0.06] bg-[#F9FAFB] p-4 sm:p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-[#111315]">{activeSchedule.title}</h4>
                    <p className="text-xs text-[#737780] flex items-center gap-1.5 mt-1">
                      <BookOpen className="w-3.5 h-3.5" /> Topic: <span className="font-semibold text-[#111315]">{activeSchedule.topics?.name || 'Curriculum Overview'}</span>
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-[#111315]">
                    {activeSchedule.start_time.slice(0, 5)} - {activeSchedule.end_time.slice(0, 5)}
                  </span>
                </div>

                {!attendanceRecord ? (
                  <form action={checkInAction.bind(null, activeSchedule.id)}>
                    <Button type="submit" className="w-full bg-[#111215] hover:bg-black text-white font-semibold rounded-full py-2.5 shadow-sm transition-all">
                      Check In & Begin Assessment
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center p-4 bg-white border border-black/[0.06] rounded-2xl text-center space-y-2">
                    <span 
                      className={`uppercase text-[10px] font-bold px-3 py-1 rounded-full ${
                        attendanceRecord.status === 'approved' 
                          ? 'bg-[#EBFD78] text-[#111315]' 
                          : 'bg-[#111315] text-white'
                      }`}
                    >
                      Status: {attendanceRecord.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-[#737780] mt-1">
                      {attendanceRecord.status === 'checked_in' && "You've checked in! Please complete your topic selection."}
                      {attendanceRecord.status === 'question_assigned' && "Your targeted assessment question is ready for you."}
                      {attendanceRecord.status === 'pending_review' && "Your answer has been submitted and is pending tutor verification."}
                      {attendanceRecord.status === 'approved' && "Attendance confirmed and approved by your tutor!"}
                    </p>
                    {['checked_in', 'question_assigned'].includes(attendanceRecord.status) && (
                      <Link 
                        href="/student/attendance" 
                        className="inline-flex items-center justify-center rounded-full text-xs font-bold bg-[#111215] text-white hover:bg-black h-9 px-5 w-full mt-2 transition-all shadow-sm"
                      >
                        Continue Session Assessment <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-[#737780] border border-dashed border-black/[0.1] rounded-2xl bg-white text-xs space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#737780]/60 mb-2" />
                <p className="font-semibold text-sm text-[#111315]">No sessions scheduled right now.</p>
                <p className="text-[11px]">Check with your administrator or browse the Central Feed for upcoming dates.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Recent History */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] p-5 border border-black/[0.06] shadow-sm">
              <p className="text-xs font-medium text-[#737780]">Approved Sessions</p>
              <div className="text-3xl font-bold text-[#111315] flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" /> {approvedCount}
              </div>
            </div>

            <div className="bg-[#EBFD78] rounded-[24px] p-5 shadow-sm text-[#111315]">
              <p className="text-xs font-medium text-[#111315]/70">Under Review</p>
              <div className="text-3xl font-bold text-[#111315] flex items-center gap-2 mt-2">
                {pendingCount}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-[#111315]">Recent Attendance Log</h3>
                <p className="text-xs text-[#737780] mt-0.5">Your past verified learning records</p>
              </div>
              <Link href="/student/calendar" className="text-xs font-semibold text-[#111315] hover:opacity-75 flex items-center gap-1">
                Calendar <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {history?.map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/[0.04] text-xs">
                  <div>
                    <p className="font-bold text-sm text-[#111315]">{rec.schedules?.title || 'Class Session'}</p>
                    <p className="text-[#737780] text-[11px] mt-0.5">
                      {rec.schedules?.topics?.name} • {new Date(rec.attendance_date).toLocaleDateString()}
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
              {(!history || history.length === 0) && (
                <div className="text-center py-8 text-[#737780] text-xs">
                  No attendance logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

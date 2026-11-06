import { createAdminClient } from '@/lib/supabase/admin'
import { AnalyticsCharts } from '@/components/charts/AnalyticsCharts'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { CentralMentoringReports, MentoringLog, TutorAttendanceLog } from '@/components/admin/CentralMentoringReports'
import { unstable_cache } from 'next/cache'

const adminPillTabs = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/tutors', label: 'Tutors' },
  { href: '/admin/schedules', label: 'Schedules' },
  { href: '/admin/topics', label: 'Topics' },
  { href: '/admin/questions', label: 'Question Bank' },
  { href: '/admin/ai', label: 'AI Generator' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/posts', label: 'Community Feed' },
]

const getCachedAnalyticsData = unstable_cache(
  async () => {
    const adminClient = createAdminClient()

    // Parallelized single Promise.all
    const [
      { data: profiles },
      { count: pendingReviews },
      { data: topics },
      { data: studentTopics },
      { data: assignments },
      { data: attendanceRaw },
      { data: tutorAttRaw }
    ] = await Promise.all([
      adminClient.from('profiles').select('id, full_name, email, role'),
      adminClient.from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      adminClient.from('topics').select('id, name'),
      adminClient.from('student_topics').select('topic_id'),
      adminClient.from('tutor_student_assignments').select('tutor_id, status'),
      adminClient.from('attendance')
        .select(`
          id, student_id, attendance_date, status, approved_at, assigned_tutor_id, assigned_topic_ids, assigned_task_instructions, approved_by,
          student:student_id(full_name, register_number, department),
          assigned_tutor:assigned_tutor_id(full_name),
          approved_tutor:approved_by(full_name),
          attempts:question_attempts(answer_text)
        `)
        .order('attendance_date', { ascending: false })
        .limit(40),
      adminClient.from('tutor_attendance')
        .select(`
          id, tutor_id, attendance_date, check_in_time, check_out_time, availability_status, total_students_taken, notes,
          tutor:tutor_id(full_name, email)
        `)
        .order('attendance_date', { ascending: false })
        .limit(40)
    ])

    const studentCount = profiles?.filter(p => p.role === 'student').length || 0
    const tutors = profiles?.filter(p => p.role === 'tutor') || []
    const tutorCount = tutors.length

    const topicMap = new Map<string, string>()
    topics?.forEach(t => topicMap.set(t.id, t.name))

    const topicData = topics?.map(t => ({
      name: t.name,
      count: studentTopics?.filter(st => st.topic_id === t.id).length || 0
    })).sort((a, b) => b.count - a.count).slice(0, 5) || []

    const workloadData = tutors.map(t => ({
      name: t.full_name.split(' ')[0],
      pending: assignments?.filter(a => a.tutor_id === t.id && a.status === 'active').length || 0
    }))

    // Format mentoring logs ("Who Studied What")
    const mentoringLogs: MentoringLog[] = (attendanceRaw || []).map((att: any) => {
      const studentObj = Array.isArray(att.student) ? att.student[0] : att.student
      const assignedTutorObj = Array.isArray(att.assigned_tutor) ? att.assigned_tutor[0] : att.assigned_tutor
      const approvedTutorObj = Array.isArray(att.approved_tutor) ? att.approved_tutor[0] : att.approved_tutor
      const attemptObj = Array.isArray(att.attempts) ? att.attempts[0] : att.attempts

      const topicNames: string[] = (att.assigned_topic_ids || [])
        .map((tId: string) => topicMap.get(tId))
        .filter(Boolean)

      return {
        id: att.id,
        student_name: studentObj?.full_name || 'Student',
        student_reg: studentObj?.register_number,
        student_dept: studentObj?.department,
        tutor_name: assignedTutorObj?.full_name || approvedTutorObj?.full_name || 'Unassigned',
        topics_covered: topicNames,
        task_instructions: att.assigned_task_instructions,
        student_answer: attemptObj?.answer_text,
        status: att.status,
        attendance_date: att.attendance_date,
        approved_at: att.approved_at
      }
    })

    // Format tutor attendance logs (4-8 PM availability)
    const tutorAttendanceLogs: TutorAttendanceLog[] = (tutorAttRaw || []).map((ta: any) => {
      const tutorObj = Array.isArray(ta.tutor) ? ta.tutor[0] : ta.tutor
      return {
        id: ta.id,
        tutor_name: tutorObj?.full_name || 'Tutor',
        tutor_email: tutorObj?.email,
        attendance_date: ta.attendance_date,
        check_in_time: ta.check_in_time,
        check_out_time: ta.check_out_time,
        availability_status: ta.availability_status,
        total_students_taken: ta.total_students_taken || 0,
        notes: ta.notes
      }
    })

    return {
      studentCount,
      tutorCount,
      pendingReviews: pendingReviews || 0,
      topicData,
      workloadData,
      mentoringLogs,
      tutorAttendanceLogs,
    }
  },
  ['admin-analytics-stats-v2'],
  { revalidate: 30, tags: ['analytics-data', 'dashboard-data'] }
)

export default async function AdminAnalyticsPage() {
  const {
    studentCount,
    tutorCount,
    pendingReviews,
    topicData,
    workloadData,
    mentoringLogs,
    tutorAttendanceLogs
  } = await getCachedAnalyticsData()

  const now = new Date()
  const dateBadge = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Central"
        firstLinePillIconName="Activity"
        firstLineSuffix="Reports"
        secondLinePrefix="Who Studied What"
        secondLineSuffix="& Lab Attendance"
        actionLabel="+ New Schedule"
        actionHref="/admin/schedules"
        settingsHref="/admin/analytics"
        dateBadge={dateBadge}
      />

      <PillTabsBar tabs={adminPillTabs} className="mb-2" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#737780]">Total Enrolled Students</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{studentCount}</div>
        </div>
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#737780]">Active Tutors (4-8 PM Lab)</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{tutorCount}</div>
        </div>
        <div className="bg-[#EBFD78] rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-[#111315]">
          <span className="text-xs font-semibold text-[#111315]/80">Pending Task Submissions</span>
          <div className="text-3xl font-bold text-[#111315] mt-2">{pendingReviews}</div>
        </div>
      </div>

      {/* Central Reports: "Who Studied What" and "Tutor Lab Attendance (4-8 PM)" */}
      <CentralMentoringReports
        mentoringLogs={mentoringLogs}
        tutorAttendanceLogs={tutorAttendanceLogs}
      />

      {/* Topic Popularity & Workload Charts */}
      <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm">
        <AnalyticsCharts topicData={topicData} workloadData={workloadData} />
      </div>
    </div>
  )
}

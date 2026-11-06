import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { TutorSelfAttendanceCard } from '@/components/tutor/TutorSelfAttendanceCard'
import { StudentsOnlineList } from '@/components/tutor/StudentsOnlineList'
import { TutorMenteesList } from '@/components/tutor/TutorMenteesList'
import { Users, CheckSquare, UserCheck, Sparkles, BookOpen } from 'lucide-react'
import Link from 'next/link'

const tutorPillTabs = [
  { href: '/tutor/dashboard', label: 'Overview' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/attendance', label: 'Review Submissions' },
]

export default async function TutorDashboard() {
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const isAdmin = fastUser?.role === 'super_admin' || fastUser?.role === 'admin'
  const adminClient = createAdminClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dateBadge = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Concurrently fetch tutor attendance, profile, topics, students, and today's attendance records
  const [
    { data: tutorProfile },
    { data: tutorAttData },
    { data: activeTopics },
    { data: allStudents },
    { data: todayAttendance },
    { data: attemptsData }
  ] = await Promise.all([
    adminClient.from('profiles').select('full_name, email, role').eq('id', userId).single(),
    adminClient.from('tutor_attendance').select('*').eq('tutor_id', userId).eq('attendance_date', today).maybeSingle(),
    adminClient.from('topics').select('id, name, category').eq('is_active', true).order('name'),
    adminClient.from('profiles').select('id, full_name, email, register_number, department, year, last_seen_at, is_online, current_session_status').eq('role', 'student').eq('status', 'active'),
    adminClient.from('attendance')
      .select('id, student_id, schedule_id, attendance_date, status, assigned_tutor_id, assigned_topic_ids, assigned_task_instructions, approved_by, tutor_feedback, student:student_id(full_name, register_number, department)')
      .eq('attendance_date', today),
    adminClient.from('question_attempts').select('id, attendance_id, student_id, answer_text, evaluation_status, ai_evaluation')
  ])

  const tutorName = tutorProfile?.full_name || 'Tutor'
  const topics = activeTopics || []
  const todayAttList = todayAttendance || []

  // Map of studentId -> attendance record today
  const studentTodayAttMap = new Map<string, any>()
  todayAttList.forEach(att => {
    studentTodayAttMap.set(att.student_id, att)
  })

  // 1. Identify "Students Online" who can be taken
  // A student is eligible if they are online/recent, and not yet claimed/approved by a tutor today
  const studentsList = allStudents || []
  const onlineStudents = studentsList.filter(s => {
    const todayRecord = studentTodayAttMap.get(s.id)
    const isAlreadyApproved = todayRecord?.status === 'approved'
    // If student is already claimed by another tutor and in progress, skip from pool
    const isClaimedByOther = todayRecord?.assigned_tutor_id && todayRecord.assigned_tutor_id !== userId
    if (isAlreadyApproved || isClaimedByOther) return false

    // If marked online or active status or simply not yet taken today:
    const isRecent = s.last_seen_at && (now.getTime() - new Date(s.last_seen_at).getTime()) < 3600000 // 1 hour
    return s.is_online || isRecent || !todayRecord?.assigned_tutor_id
  })

  // 2. Identify "My Active Mentees Today"
  // Records assigned to this tutor, or approved by this tutor today
  const attemptsByAttendanceId = new Map<string, any>()
  attemptsData?.forEach(att => {
    attemptsByAttendanceId.set(att.attendance_id, att)
  })

  const topicsMap = new Map<string, { id: string; name: string }>()
  topics.forEach(t => topicsMap.set(t.id, t))

  const myMenteesRecords = todayAttList
    .filter(att => att.assigned_tutor_id === userId || att.approved_by === userId)
    .map((att: any) => {
      const topicObjs = (att.assigned_topic_ids || [])
        .map((tId: string) => topicsMap.get(tId))
        .filter(Boolean)

      return {
        id: att.id,
        student_id: att.student_id,
        status: att.status,
        attendance_date: att.attendance_date,
        assigned_task_instructions: att.assigned_task_instructions,
        tutor_feedback: att.tutor_feedback,
        student: att.student,
        topics: topicObjs,
        attempt: attemptsByAttendanceId.get(att.id)
      }
    })

  const menteesCount = myMenteesRecords.length
  const pendingApprovalsCount = myMenteesRecords.filter(m => m.status === 'pending_review' || m.status === 'task_submitted' || m.status === 'answer_submitted').length
  const approvedMenteesCount = myMenteesRecords.filter(m => m.status === 'approved').length

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Playful Headline with Date Badge */}
      <DesignPageHeader
        firstLinePrefix={`Welcome, ${tutorName.split(' ')[0]}`}
        firstLinePillIconName="UserCheck"
        firstLineSuffix="Lab Shift"
        secondLinePrefix="Mentoring"
        secondLineSuffix="4:00 PM – 8:00 PM"
        actionLabel="Review Attendance"
        actionHref="/tutor/attendance"
        settingsHref="/tutor/dashboard"
        dateBadge={dateBadge}
      />

      {/* Horizontal Pill Tabs Bar */}
      <PillTabsBar tabs={tutorPillTabs} className="mb-2" />

      {/* 1. Tutor Self-Attendance Card for 4:00 PM - 8:00 PM */}
      <TutorSelfAttendanceCard
        tutorAttendance={tutorAttData || null}
        tutorName={tutorName}
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737780]">Students in Waiting Pool</span>
            <Users className="w-4 h-4 text-[#111315]" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {onlineStudents.length}
          </div>
          <span className="text-[11px] text-[#737780] mt-1">Available to pick up and assign</span>
        </div>

        <div className="bg-[#EBFD78] rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-[#111315]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111315]/80">My Mentees Today</span>
            <BookOpen className="w-4 h-4 text-[#111315]" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {menteesCount}
          </div>
          <span className="text-[11px] text-[#111315]/80 mt-1">
            {approvedMenteesCount} verified &bull; {pendingApprovalsCount} awaiting review
          </span>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737780]">Submissions Pending Review</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-[#111315] mt-3">
            {pendingApprovalsCount}
          </div>
          <span className="text-[11px] text-[#737780] mt-1">Ready for one-click attendance grant</span>
        </div>
      </div>

      {/* 2. Main Section: Subheading "Students Online" with "Take Student" Actions */}
      <StudentsOnlineList
        students={onlineStudents}
        topics={topics}
      />

      {/* 3. "My Active Mentees Today" Section with Task Review & Approval */}
      <TutorMenteesList
        records={myMenteesRecords}
      />
    </div>
  )
}

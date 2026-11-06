import { createAdminClient } from '@/lib/supabase/admin'
import { getFastUser } from '@/lib/supabase/server'
import { DesignPageHeader } from '@/components/layout/DesignPageHeader'
import { PillTabsBar } from '@/components/layout/PillTabsBar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, BookOpen, HelpCircle, UserCheck, Clock } from 'lucide-react'
import { submitTopicsAction, submitAnswerAction } from '../actions'

const studentPillTabs = [
  { href: '/student/dashboard', label: 'Overview' },
  { href: '/student/attendance', label: 'Attendance Check-in' },
  { href: '/student/calendar', label: 'Calendar' },
  { href: '/student/progress', label: 'Progress & Topics' },
  { href: '/student/feed', label: 'Central Feed' },
  { href: '/student/profile', label: 'My Profile' },
]

export default async function AttendanceFlowPage() {
  const fastUser = await getFastUser()
  const userId = fastUser?.id || ''
  const adminClient = createAdminClient()

  // Fetch the latest active or in-progress attendance record
  const { data: attendances } = await adminClient
    .from('attendance')
    .select('*, schedules(title, date), questions(question_text, expected_concepts), assigned_tutor:assigned_tutor_id(full_name)')
    .eq('student_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  const attendance = attendances?.[0]

  // If topics were assigned by tutor, fetch topic objects
  let assignedTopics: Array<{ id: string; name: string }> = []
  if (attendance?.assigned_topic_ids && attendance.assigned_topic_ids.length > 0) {
    const { data: topicsData } = await adminClient
      .from('topics')
      .select('id, name')
      .in('id', attendance.assigned_topic_ids)
    assignedTopics = topicsData || []
  }

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <DesignPageHeader
        firstLinePrefix="Mentored"
        firstLinePillIconName="CheckSquare"
        firstLineSuffix="Daily Attendance"
        secondLinePrefix="and"
        secondLineSuffix="Assessments"
        actionLabel="Back to Dashboard"
        actionHref="/student/dashboard"
        settingsHref="/student/profile"
      />

      <PillTabsBar tabs={studentPillTabs} className="mb-2" />

      {!attendance && (
        <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-8 max-w-lg mx-auto text-center space-y-4 my-8">
          <h2 className="text-xl font-bold text-[#111315]">No Active Session Found</h2>
          <p className="text-xs text-[#737780]">
            Please navigate to your dashboard and verify your session status. You are active in the lab pool!
          </p>
          <Link 
            href="/student/dashboard" 
            className="inline-flex items-center justify-center rounded-full text-xs font-semibold bg-[#111215] text-white hover:bg-black h-10 px-6 transition-all"
          >
            Go to Student Dashboard
          </Link>
        </div>
      )}

      {/* STATE 1: Checked in -> Needs Topic Selection (if self-service) */}
      {attendance && attendance.status === 'checked_in' && !attendance.assigned_tutor_id && (
        <TopicSelectionView attendance={attendance} adminClient={adminClient} />
      )}

      {/* STATE 2: Question or Task Assigned by Tutor -> Needs Answer */}
      {attendance && attendance.status === 'question_assigned' && (
        <div className="max-w-2xl mx-auto rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBFD78] flex items-center justify-center text-[#111315] shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111315]">
                  {attendance.assigned_tutor?.full_name 
                    ? `Assigned Task by Mentor: ${attendance.assigned_tutor.full_name}`
                    : 'Session Assessment Task'}
                </h3>
              </div>
              <p className="text-xs text-[#737780]">
                Complete your work and submit your solution below to verify your presence and earn attendance credit.
              </p>
            </div>
          </div>

          {/* Assigned Topics Badges */}
          {assignedTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737780]">
                Assigned Topics:
              </span>
              {assignedTopics.map(t => (
                <span
                  key={t.id}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] border border-black/[0.04] text-[#111315]"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}

          <form action={submitAnswerAction} className="space-y-5" autoComplete="off">
            <input type="hidden" name="attendance_id" value={attendance.id} />
            <input type="hidden" name="question_id" value={attendance.question_id || ''} />
            
            <div className="bg-[#F9FAFB] p-4 sm:p-5 rounded-2xl border border-black/[0.04] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737780]">
                {attendance.assigned_task_instructions ? "Mentor's Task Instructions:" : "Assigned Question:"}
              </span>
              <p className="text-sm font-semibold text-[#111315] leading-relaxed whitespace-pre-wrap">
                {attendance.assigned_task_instructions || attendance.questions?.question_text || "Explain the core concepts, edge cases, and algorithmic complexity of the problems you worked on today."}
              </p>
              {attendance.questions?.expected_concepts && attendance.questions.expected_concepts.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#737780]">Key concepts to mention:</span>
                  {attendance.questions.expected_concepts.map((c: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] rounded-full py-0.5">{c}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="answer" className="text-xs font-semibold text-[#111315]">
                Your Solution / Explanation / Code Submission
              </Label>
              <Textarea 
                id="answer" 
                name="answer" 
                placeholder="Write your explanation, algorithmic approach, time & space complexities, or paste code..." 
                className="min-h-[180px] rounded-2xl border-black/[0.08] text-sm font-mono focus:ring-black"
                required 
              />
            </div>
            
            <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold py-2.5">
              Submit Task to Mentor for Verification
            </Button>
          </form>
        </div>
      )}

      {/* STATE 3: Pending Review */}
      {attendance && (attendance.status === 'pending_review' || attendance.status === 'task_submitted' || attendance.status === 'answer_submitted') && (
        <div className="max-w-md mx-auto rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-8 text-center space-y-4 my-8">
          <div className="mx-auto w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#111315]">Task Submitted!</h2>
          <p className="text-xs text-[#737780] max-w-sm mx-auto">
            Your task submission has been received and sent to your mentor
            {attendance.assigned_tutor ? ` (${attendance.assigned_tutor.full_name})` : ''} for evaluation. Once verified, attendance will be granted.
          </p>
          <div className="p-3 bg-[#F9FAFB] rounded-2xl inline-block text-xs font-mono border border-black/[0.04]">
            Status: <strong className="uppercase font-bold text-amber-800">Pending Mentor Signoff</strong>
          </div>
          <div>
            <Link 
              href="/student/dashboard" 
              className="inline-flex items-center justify-center rounded-full text-xs font-semibold bg-[#111215] text-white hover:bg-black h-10 px-6 mt-4 transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* STATE 4: Approved */}
      {attendance && attendance.status === 'approved' && (
        <div className="max-w-md mx-auto rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-8 text-center space-y-4 my-8">
          <div className="mx-auto w-14 h-14 bg-[#EBFD78] text-[#111315] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-bold text-[#111315]">Attendance Approved!</h2>
          <p className="text-xs text-[#737780] max-w-sm mx-auto">
            Your work has been verified and your attendance for today is officially approved.
          </p>
          {attendance.tutor_feedback && (
            <div className="p-3 bg-[#F9FAFB] rounded-2xl text-xs border border-black/[0.04] text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737780] block mb-1">Mentor Feedback:</span>
              <p className="text-[#111315] italic">&ldquo;{attendance.tutor_feedback}&rdquo;</p>
            </div>
          )}
          <div>
            <Link 
              href="/student/dashboard" 
              className="inline-flex items-center justify-center rounded-full text-xs font-semibold bg-[#111215] text-white hover:bg-black h-10 px-6 mt-4 transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

async function TopicSelectionView({ attendance, adminClient }: { attendance: any; adminClient: any }) {
  const { data: topics } = await adminClient.from('topics').select('*').eq('is_active', true).order('name')

  return (
    <div className="max-w-2xl mx-auto rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EBFD78] flex items-center justify-center text-[#111315]">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111315]">What did you study today?</h3>
          <p className="text-xs text-[#737780]">
            Select the topics covered during <strong>{attendance.schedules?.title || 'your session'}</strong> to receive your targeted assessment.
          </p>
        </div>
      </div>

      <form action={submitTopicsAction} className="space-y-5" autoComplete="off">
        <input type="hidden" name="attendance_id" value={attendance.id} />
        <input type="hidden" name="schedule_id" value={attendance.schedule_id} />
        
        <div className="space-y-2">
          {topics?.map((topic: any) => (
            <label key={topic.id} className="flex items-center space-x-3 border border-black/[0.06] p-3.5 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                name="topics" 
                value={topic.id}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" 
              />
              <div className="grid gap-0.5 text-xs">
                <span className="font-semibold text-[#111315]">{topic.name}</span>
                <span className="text-[#737780]">{topic.category}</span>
              </div>
            </label>
          ))}
        </div>
        
        <Button type="submit" className="w-full rounded-full bg-[#111215] hover:bg-black text-white font-semibold py-2.5">
          Continue to Assessment Question
        </Button>
      </form>
    </div>
  )
}

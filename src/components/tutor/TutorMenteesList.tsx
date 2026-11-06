'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Clock, BookOpen, Check, MessageSquare, ExternalLink } from 'lucide-react'
import { grantAttendanceDirectAction } from '@/app/(protected)/tutor/actions'
import Link from 'next/link'

interface MenteeAttendance {
  id: string
  student_id: string
  status: string
  attendance_date: string
  assigned_task_instructions?: string | null
  tutor_feedback?: string | null
  student?: {
    full_name: string
    register_number?: string | null
    department?: string | null
  }
  topics?: Array<{ id: string; name: string }>
  attempt?: {
    answer_text?: string
    evaluation_status?: string
    ai_evaluation?: any
  }
}

interface TutorMenteesListProps {
  records: MenteeAttendance[]
}

export function TutorMenteesList({ records }: TutorMenteesListProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedRecord, setSelectedRecord] = useState<MenteeAttendance | null>(null)
  const [feedback, setFeedback] = useState('')

  const handleGrantAttendance = (attendanceId: string, customFeedback?: string) => {
    const formData = new FormData()
    formData.append('attendance_id', attendanceId)
    formData.append('feedback', customFeedback || 'Attendance granted. Concept and task verified.')

    startTransition(async () => {
      await grantAttendanceDirectAction(formData)
      setSelectedRecord(null)
      setFeedback('')
    })
  }

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.06] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-[#111315]">My Active Mentees Today</h3>
          <p className="text-xs text-[#737780] mt-0.5">
            Students you have taken for today&apos;s session. Review their submitted tasks and grant attendance.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-black text-[#EBFD78] self-start sm:self-auto">
          {records.length} Taken Today
        </span>
      </div>

      <div className="space-y-3">
        {records.map((rec) => {
          const isSubmitted = rec.status === 'pending_review' || rec.status === 'task_submitted' || rec.status === 'answer_submitted'
          const isApproved = rec.status === 'approved'

          return (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl border border-black/[0.06] bg-[#F9FAFB] space-y-3 transition-all hover:border-black/15"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111315]">
                      {rec.student?.full_name || 'Student'}
                    </span>
                    {rec.student?.register_number && (
                      <span className="font-mono text-xs text-[#737780]">
                        ({rec.student.register_number})
                      </span>
                    )}
                  </div>
                  {rec.student?.department && (
                    <span className="text-[11px] text-[#737780] block">
                      {rec.student.department}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isApproved && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBFD78] text-[#111315] inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Attendance Granted
                    </span>
                  )}

                  {isSubmitted && !isApproved && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                      Task Submitted • Needs Approval
                    </span>
                  )}

                  {!isSubmitted && !isApproved && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      Task in Progress (Student Working)
                    </span>
                  )}
                </div>
              </div>

              {/* Assigned Topics */}
              {rec.topics && rec.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737780] mr-1">
                    Topics:
                  </span>
                  {rec.topics.map(t => (
                    <span
                      key={t.id}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-black/[0.06] text-[#111315]"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Assigned Instructions */}
              {rec.assigned_task_instructions && (
                <div className="text-xs bg-white p-3 rounded-xl border border-black/[0.04] text-[#111315]/80">
                  <strong className="text-[#111315] block mb-0.5 text-[11px]">Instructions Assigned:</strong>
                  {rec.assigned_task_instructions}
                </div>
              )}

              {/* Student's Submitted Answer Snippet if Submitted */}
              {isSubmitted && rec.attempt?.answer_text && (
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-amber-900 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      Student Submission:
                    </strong>
                    <Link
                      href={`/tutor/attendance/${rec.id}`}
                      className="text-[11px] text-[#111315] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Full Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-[#111315] whitespace-pre-wrap line-clamp-3 bg-[#F9FAFB] p-2.5 rounded-lg border border-black/[0.04]">
                    {rec.attempt.answer_text}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {rec.tutor_feedback && (
                  <span className="text-[11px] text-[#737780] italic">
                    Feedback: &ldquo;{rec.tutor_feedback}&rdquo;
                  </span>
                )}

                {isSubmitted && !isApproved && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleGrantAttendance(rec.id)}
                      disabled={isPending}
                      className="px-5 py-2 rounded-full bg-[#111215] text-[#EBFD78] hover:bg-black font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#EBFD78]" />
                      {isPending ? 'Verifying...' : 'Grant Attendance'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {records.length === 0 && (
          <div className="text-center py-8 text-xs text-[#737780]">
            You have not taken any students yet today. Pick up online students from the list above!
          </div>
        )}
      </div>
    </div>
  )
}

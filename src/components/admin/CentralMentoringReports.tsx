'use client'

import { useState } from 'react'
import { BookOpen, UserCheck, Clock, CheckCircle2, Search, Filter, ShieldCheck } from 'lucide-react'

export interface MentoringLog {
  id: string
  student_name: string
  student_reg?: string | null
  student_dept?: string | null
  tutor_name: string
  topics_covered: string[]
  task_instructions?: string | null
  student_answer?: string | null
  status: string
  attendance_date: string
  approved_at?: string | null
}

export interface TutorAttendanceLog {
  id: string
  tutor_name: string
  tutor_email?: string
  attendance_date: string
  check_in_time?: string | null
  check_out_time?: string | null
  availability_status?: string | null
  total_students_taken: number
  notes?: string | null
}

interface CentralMentoringReportsProps {
  mentoringLogs: MentoringLog[]
  tutorAttendanceLogs: TutorAttendanceLog[]
}

export function CentralMentoringReports({
  mentoringLogs,
  tutorAttendanceLogs
}: CentralMentoringReportsProps) {
  const [activeTab, setActiveTab] = useState<'study_logs' | 'tutor_attendance'>('study_logs')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredMentoring = mentoringLogs.filter(log => {
    const matchesSearch =
      log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tutor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.student_reg && log.student_reg.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.topics_covered.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '—'
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '—'
    }
  }

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.06] shadow-sm space-y-5">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-[#111315]">Central Admin Reports</h3>
          <p className="text-xs text-[#737780] mt-0.5">
            Real-time platform logs: review student progress by mentor and tutor evening lab presence (4:00 PM – 8:00 PM).
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-full self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('study_logs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'study_logs'
                ? 'bg-[#111215] text-[#EBFD78] shadow-sm'
                : 'text-[#737780] hover:text-[#111315]'
            }`}
          >
            Who Studied What ({mentoringLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('tutor_attendance')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tutor_attendance'
                ? 'bg-[#111215] text-[#EBFD78] shadow-sm'
                : 'text-[#737780] hover:text-[#111315]'
            }`}
          >
            Tutor Lab Attendance ({tutorAttendanceLogs.length})
          </button>
        </div>
      </div>

      {/* 1. Who Studied What Report */}
      {activeTab === 'study_logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737780]" />
              <input
                type="text"
                placeholder="Search student, mentor, or topic..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-full bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-3.5 py-2.5 rounded-full bg-[#F9FAFB] border border-black/[0.08] text-[#111315] focus:outline-none cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="approved">Approved & Verified</option>
              <option value="pending_review">Pending Review</option>
              <option value="question_assigned">Task in Progress</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-black/[0.06] text-[#737780] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Assigned Mentor</th>
                  <th className="py-3.5 px-4">Topics Covered</th>
                  <th className="py-3.5 px-4">Task Given & Submission</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredMentoring.map(log => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB]/60 transition-colors">
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <span className="font-bold text-[#111315] block truncate">
                        {log.student_name}
                      </span>
                      <span className="text-[11px] text-[#737780] font-mono">
                        {log.student_reg || log.student_dept || 'Student'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[130px]">
                      <span className="font-semibold text-[#111315] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {log.tutor_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {log.topics_covered.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-[#111315]"
                          >
                            {t}
                          </span>
                        ))}
                        {log.topics_covered.length === 0 && (
                          <span className="text-[#9CA3AF] text-[11px]">General Lab</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      {log.task_instructions && (
                        <p className="text-[11px] text-[#111315] line-clamp-1 mb-0.5">
                          <strong>Task:</strong> {log.task_instructions}
                        </p>
                      )}
                      {log.student_answer ? (
                        <p className="text-[11px] text-[#737780] line-clamp-1 italic">
                          <strong>Ans:</strong> &ldquo;{log.student_answer}&rdquo;
                        </p>
                      ) : (
                        <span className="text-[11px] text-[#9CA3AF]">Awaiting student answer</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#737780] font-mono text-[11px]">
                      {new Date(log.attendance_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {log.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#EBFD78] text-[#111315] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Approved
                        </span>
                      ) : log.status === 'pending_review' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredMentoring.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-[#737780]">
                      No mentoring logs matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Tutor 4-8 PM Lab Attendance Report */}
      {activeTab === 'tutor_attendance' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-black/[0.06] text-[#737780] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Tutor Name</th>
                  <th className="py-3.5 px-4">Shift Date</th>
                  <th className="py-3.5 px-4">Check-in (4-8 PM)</th>
                  <th className="py-3.5 px-4">Check-out</th>
                  <th className="py-3.5 px-4">Students Mentored</th>
                  <th className="py-3.5 px-4 text-right">Availability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {tutorAttendanceLogs.map(tutor => (
                  <tr key={tutor.id} className="hover:bg-[#F9FAFB]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111315]">
                      {tutor.tutor_name}
                      {tutor.tutor_email && (
                        <span className="text-[11px] text-[#737780] font-normal block">
                          {tutor.tutor_email}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737780]">
                      {new Date(tutor.attendance_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#111315]">
                      {formatTime(tutor.check_in_time)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#737780]">
                      {formatTime(tutor.check_out_time)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111315] bg-[#F9FAFB] px-2.5 py-1 rounded-full border border-black/[0.04]">
                        {tutor.total_students_taken} students
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {tutor.availability_status === 'available' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          On Duty & Available
                        </span>
                      ) : tutor.availability_status === 'busy_mentoring' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Busy Mentoring
                        </span>
                      ) : tutor.availability_status === 'completed' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          Concluded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          Present
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {tutorAttendanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-[#737780]">
                      No tutor attendance logs recorded yet for the 4:00 PM – 8:00 PM session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

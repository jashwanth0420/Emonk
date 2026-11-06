'use client'

import { Users, Wifi, Clock, GraduationCap } from 'lucide-react'
import { TakeStudentModal } from './TakeStudentModal'

interface Topic {
  id: string
  name: string
  category?: string | null
}

interface OnlineStudent {
  id: string
  full_name: string
  email?: string
  register_number?: string | null
  department?: string | null
  year?: number | null
  last_seen_at?: string | null
  current_session_status?: string | null
  is_online?: boolean
}

interface StudentsOnlineListProps {
  students: OnlineStudent[]
  topics: Topic[]
}

export function StudentsOnlineList({ students, topics }: StudentsOnlineListProps) {
  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.06] shadow-sm space-y-5">
      {/* Subheading & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-[#111315]">Students Online</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBFD78] text-[#111315]">
              {students.length} Active
            </span>
          </div>
          <p className="text-xs text-[#737780] mt-0.5">
            Students logged into the platform ready for mentoring. Click &ldquo;Take Student&rdquo; to assign topics and tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#737780] bg-[#F9FAFB] px-3 py-1.5 rounded-full border border-black/[0.04] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Pool (4:00 PM – 8:00 PM)</span>
        </div>
      </div>

      {/* Student List */}
      <div className="divide-y divide-black/[0.04]">
        {students.map((student) => {
          const initials = student.full_name
            ? student.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'ST'

          return (
            <div
              key={student.id}
              className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAFB]/70 rounded-2xl px-3 transition-colors -mx-3"
            >
              {/* Student Identity */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#111215] text-[#EBFD78] font-bold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  {/* Green Online Dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111315] truncate">
                      {student.full_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Online
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#737780] mt-0.5">
                    {student.register_number && (
                      <span className="font-mono text-[11px] font-semibold text-[#111315]">
                        {student.register_number}
                      </span>
                    )}
                    {student.department && <span>&bull; {student.department}</span>}
                    {student.year && <span>&bull; Year {student.year}</span>}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <TakeStudentModal student={student} topics={topics} />
              </div>
            </div>
          )
        })}

        {students.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-[#737780]">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#111315]">No Students Online in Waiting Pool</h4>
            <p className="text-xs text-[#737780] max-w-sm mx-auto">
              When students log into their dashboard during the 4:00 PM – 8:00 PM session, their profiles will automatically appear here for you to pick up.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

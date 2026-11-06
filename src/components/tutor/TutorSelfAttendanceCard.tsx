'use client'

import { useTransition } from 'react'
import { Clock, CheckCircle2, UserCheck, ShieldAlert, Coffee } from 'lucide-react'
import { markTutorAttendanceAction } from '@/app/(protected)/tutor/actions'

interface TutorSelfAttendanceProps {
  tutorAttendance: {
    id?: string
    attendance_date?: string
    check_in_time?: string
    check_out_time?: string | null
    availability_status?: string
    total_students_taken?: number
    notes?: string | null
  } | null
  tutorName: string
}

export function TutorSelfAttendanceCard({ tutorAttendance, tutorName }: TutorSelfAttendanceProps) {
  const [isPending, startTransition] = useTransition()

  const isCheckedIn = Boolean(tutorAttendance?.check_in_time)
  const isCheckedOut = Boolean(tutorAttendance?.check_out_time)
  const status = tutorAttendance?.availability_status || (isCheckedIn ? 'available' : 'not_checked_in')
  const studentsTaken = tutorAttendance?.total_students_taken || 0

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const handleAction = (actionType: 'check_in' | 'check_out' | 'toggle_status', newStatus?: string) => {
    const formData = new FormData()
    formData.append('actionType', actionType)
    if (newStatus) {
      formData.append('status', newStatus)
    }
    startTransition(async () => {
      await markTutorAttendanceAction(formData)
    })
  }

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#111215] text-[#EBFD78] inline-flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            Class Shift: 4:00 PM – 8:00 PM
          </span>

          {isCheckedIn && !isCheckedOut && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
              status === 'available'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {status === 'available' ? 'On Duty & Available' : 'Busy Mentoring'}
            </span>
          )}

          {isCheckedOut && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
              Shift Concluded
            </span>
          )}

          {!isCheckedIn && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              Attendance Pending
            </span>
          )}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111315]">
            Tutor Daily Presence & Lab Availability
          </h2>
          <p className="text-xs text-[#737780] mt-0.5">
            {isCheckedIn ? (
              <>
                Logged in as <strong className="text-[#111315]">{tutorName}</strong> &bull; Checked in at{' '}
                <strong className="text-[#111315]">{formatTime(tutorAttendance?.check_in_time)}</strong>
                {isCheckedOut && ` &bull; Clocked out at ${formatTime(tutorAttendance?.check_out_time)}`}
              </>
            ) : (
              'Mark your availability for today so online students can be routed and assigned to your mentoring session.'
            )}
          </p>
        </div>

        {isCheckedIn && (
          <div className="flex items-center gap-4 pt-1 text-xs">
            <span className="text-[#737780]">
              Students taken today: <strong className="text-[#111315]">{studentsTaken}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto">
        {!isCheckedIn ? (
          <button
            onClick={() => handleAction('check_in')}
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#111215] text-[#EBFD78] hover:bg-black font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#EBFD78]" />
            {isPending ? 'Recording...' : 'Mark My Attendance (4-8 PM)'}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {!isCheckedOut && (
              <>
                <button
                  onClick={() => handleAction('toggle_status', status === 'available' ? 'busy_mentoring' : 'available')}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-full font-semibold text-xs transition-all border ${
                    status === 'available'
                      ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {status === 'available' ? 'Set as Busy' : 'Set as Available'}
                </button>

                <button
                  onClick={() => handleAction('check_out')}
                  disabled={isPending}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Processing...' : 'Clock Out (8 PM)'}
                </button>
              </>
            )}

            {isCheckedOut && (
              <button
                onClick={() => handleAction('check_in')}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#111215] text-white hover:bg-black font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Re-open Availability
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

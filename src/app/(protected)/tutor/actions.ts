'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function reviewAttendanceAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const action = formData.get('action') as 'approved' | 'rejected'
  const feedback = formData.get('feedback') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { data: attendance } = await supabase
    .from('attendance')
    .select('student_id')
    .eq('id', attendanceId)
    .single()

  if (!attendance) return { error: "Attendance not found" }

  const { data: assignment } = await supabase
    .from('tutor_student_assignments')
    .select('id')
    .eq('tutor_id', user.id)
    .eq('student_id', attendance.student_id)
    .eq('status', 'active')
    .single()

  if (!assignment) return { error: "Not authorized to review this student" }

  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      status: action,
      approved_by: user.id,
      approved_at: action === 'approved' ? new Date().toISOString() : null,
      rejected_at: action === 'rejected' ? new Date().toISOString() : null,
      tutor_feedback: feedback
    })
    .eq('id', attendanceId)

  if (updateError) return { error: updateError.message }

  await supabase.from('attendance_reviews').insert({
    attendance_id: attendanceId,
    reviewer_id: user.id,
    action: action,
    feedback: feedback
  })

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: `ATTENDANCE_${action.toUpperCase()}`,
    entity_type: 'attendance',
    entity_id: attendanceId,
  })

  revalidatePath('/tutor/attendance')
  revalidatePath('/tutor/dashboard')
  redirect('/tutor/attendance')
}

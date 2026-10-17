'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function reviewAttendanceAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const action = formData.get('action') as 'approved' | 'rejected'
  const feedback = (formData.get('feedback') as string)?.trim() || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // 1. Fetch attendance
  const { data: attendance } = await adminClient
    .from('attendance')
    .select('student_id, status')
    .eq('id', attendanceId)
    .single()

  if (!attendance) {
    redirect('/tutor/attendance?error=Attendance+record+not+found')
  }

  // 2. Authorization: Allow Super Admins/Admins OR Assigned Tutors
  const { data: userProfile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin'

  if (!isAdmin) {
    const { data: assignment } = await adminClient
      .from('tutor_student_assignments')
      .select('id')
      .eq('tutor_id', user.id)
      .eq('student_id', attendance.student_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!assignment) {
      redirect(`/tutor/attendance?error=${encodeURIComponent('You are not assigned to review this student.')}`)
    }
  }

  // 3. Update attendance record
  const { error: updateError } = await adminClient
    .from('attendance')
    .update({
      status: action,
      approved_by: user.id,
      approved_at: action === 'approved' ? new Date().toISOString() : null,
      rejected_at: action === 'rejected' ? new Date().toISOString() : null,
      tutor_feedback: feedback
    })
    .eq('id', attendanceId)

  if (updateError) {
    redirect(`/tutor/attendance?error=${encodeURIComponent(updateError.message)}`)
  }

  // 4. Create review entry
  await adminClient.from('attendance_reviews').insert({
    attendance_id: attendanceId,
    reviewer_id: user.id,
    action: action,
    feedback: feedback
  })

  // 5. Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: `ATTENDANCE_${action.toUpperCase()}`,
    entity_type: 'attendance',
    entity_id: attendanceId,
    new_data: { action, feedback }
  })

  revalidatePath('/tutor/attendance')
  revalidatePath('/tutor/dashboard')
  revalidatePath('/student/dashboard')
  revalidatePath('/student/attendance')
  revalidatePath('/student/calendar')
  revalidatePath('/student/progress')
  
  redirect(`/tutor/attendance?success=${encodeURIComponent(`Attendance successfully ${action}!`)}`)
}

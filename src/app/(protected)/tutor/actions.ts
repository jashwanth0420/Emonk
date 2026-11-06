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

  // 4. Update student presence state
  if (action === 'approved') {
    await adminClient.from('profiles').update({
      current_session_status: 'attendance_granted'
    }).eq('id', attendance.student_id)
  }

  // 5. Create review entry
  await adminClient.from('attendance_reviews').insert({
    attendance_id: attendanceId,
    reviewer_id: user.id,
    action: action,
    feedback: feedback
  })

  // 6. Audit log
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

/**
 * Tutor Self-Attendance Marking for 4:00 PM - 8:00 PM Session
 */
export async function markTutorAttendanceAction(formData: FormData) {
  const actionType = formData.get('actionType') as 'check_in' | 'check_out' | 'toggle_status'
  const newStatus = (formData.get('status') as string) || 'available'
  const notes = (formData.get('notes') as string) || 'Lab Session 4:00 PM - 8:00 PM'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  try {
    const { data: existing } = await adminClient
      .from('tutor_attendance')
      .select('id, availability_status, check_in_time')
      .eq('tutor_id', user.id)
      .eq('attendance_date', today)
      .maybeSingle()

    if (actionType === 'check_in') {
      if (existing) {
        // Update to available
        await adminClient
          .from('tutor_attendance')
          .update({
            availability_status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await adminClient
          .from('tutor_attendance')
          .insert({
            tutor_id: user.id,
            attendance_date: today,
            check_in_time: new Date().toISOString(),
            availability_status: 'available',
            notes: notes
          })
      }
    } else if (actionType === 'check_out') {
      if (existing) {
        await adminClient
          .from('tutor_attendance')
          .update({
            check_out_time: new Date().toISOString(),
            availability_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      }
    } else if (actionType === 'toggle_status') {
      if (existing) {
        await adminClient
          .from('tutor_attendance')
          .update({
            availability_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      }
    }
  } catch (err) {
    console.warn('tutor_attendance table operation note:', err)
  }

  revalidatePath('/tutor/dashboard')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/analytics')
}

/**
 * Tutor Picks Up Student: "Take Student" + Assign Topics & Task Instructions
 */
export async function takeStudentAction(formData: FormData) {
  const studentId = formData.get('student_id') as string
  const taskInstructions = ((formData.get('task_instructions') as string) || '').trim()
  const topicIdsRaw = formData.getAll('topic_ids') as string[]
  const topicIds = topicIdsRaw.filter(Boolean)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Get or create today's schedule for the 4-8 PM evening lab
  let scheduleId: string | null = null
  const { data: todaySchedules } = await adminClient
    .from('schedules')
    .select('id')
    .eq('date', today)
    .eq('status', 'active')
    .limit(1)

  if (todaySchedules && todaySchedules.length > 0) {
    scheduleId = todaySchedules[0].id
  } else {
    // Find any active schedule
    const { data: anySchedule } = await adminClient
      .from('schedules')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (anySchedule) {
      scheduleId = anySchedule.id
    } else {
      // Create a default evening lab schedule
      const { data: newSched } = await adminClient
        .from('schedules')
        .insert({
          title: 'Evening Lab Session (4:00 PM - 8:00 PM)',
          description: 'Daily practical concepts and hands-on task review.',
          date: today,
          start_time: '16:00:00',
          end_time: '20:00:00',
          created_by: user.id,
          status: 'active'
        })
        .select('id')
        .single()
      scheduleId = newSched?.id || null
    }
  }

  if (!scheduleId) {
    return { success: false, error: 'Could not resolve an active schedule for today.' }
  }

  // 2. Assign tutor to student in tutor_student_assignments
  try {
    const { data: existingAssignment } = await adminClient
      .from('tutor_student_assignments')
      .select('id')
      .eq('tutor_id', user.id)
      .eq('student_id', studentId)
      .maybeSingle()

    if (!existingAssignment) {
      await adminClient.from('tutor_student_assignments').insert({
        tutor_id: user.id,
        student_id: studentId,
        assigned_by: user.id,
        status: 'active'
      })
    }
  } catch (err) {
    console.warn('Assignment linking note:', err)
  }

  // 3. Upsert attendance record for today with assigned tutor & task instructions
  const defaultTask = taskInstructions || 'Review the assigned topics, implement the solutions, and explain your conceptual approach and complexity.'

  const { data: existingAttendance } = await adminClient
    .from('attendance')
    .select('id')
    .eq('student_id', studentId)
    .eq('schedule_id', scheduleId)
    .maybeSingle()

  if (existingAttendance) {
    await adminClient
      .from('attendance')
      .update({
        assigned_tutor_id: user.id,
        assigned_at: new Date().toISOString(),
        assigned_topic_ids: topicIds.length > 0 ? topicIds : null,
        assigned_task_instructions: defaultTask,
        status: 'question_assigned',
        tutor_feedback: null
      })
      .eq('id', existingAttendance.id)
  } else {
    await adminClient
      .from('attendance')
      .insert({
        student_id: studentId,
        schedule_id: scheduleId,
        attendance_date: today,
        check_in_at: new Date().toISOString(),
        assigned_tutor_id: user.id,
        assigned_at: new Date().toISOString(),
        assigned_topic_ids: topicIds.length > 0 ? topicIds : null,
        assigned_task_instructions: defaultTask,
        status: 'question_assigned'
      })
  }

  // 4. Update student's presence status
  await adminClient.from('profiles').update({
    current_session_status: 'in_mentorship'
  }).eq('id', studentId)

  // 5. Update tutor attendance count
  try {
    const { data: tutorAtt } = await adminClient
      .from('tutor_attendance')
      .select('id, total_students_taken')
      .eq('tutor_id', user.id)
      .eq('attendance_date', today)
      .maybeSingle()

    if (tutorAtt) {
      await adminClient
        .from('tutor_attendance')
        .update({
          total_students_taken: (tutorAtt.total_students_taken || 0) + 1,
          availability_status: 'busy_mentoring'
        })
        .eq('id', tutorAtt.id)
    }
  } catch (err) {
    console.warn('tutor_attendance total_students_taken update note:', err)
  }

  revalidatePath('/tutor/dashboard')
  revalidatePath('/tutor/students')
  revalidatePath('/tutor/attendance')
  revalidatePath('/student/dashboard')
  revalidatePath('/student/attendance')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/analytics')

  return { success: true }
}

/**
 * One-Click Grant Attendance directly from Tutor Dashboard
 */
export async function grantAttendanceDirectAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const feedback = ((formData.get('feedback') as string) || 'Attendance granted. Work verified by mentor.').trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  const { data: att } = await adminClient
    .from('attendance')
    .select('id, student_id')
    .eq('id', attendanceId)
    .single()

  if (!att) {
    return { success: false, error: 'Record not found' }
  }

  // Update attendance to approved
  await adminClient
    .from('attendance')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      tutor_feedback: feedback
    })
    .eq('id', attendanceId)

  // Update student presence status
  await adminClient.from('profiles').update({
    current_session_status: 'attendance_granted'
  }).eq('id', att.student_id)

  // Create review record
  try {
    await adminClient.from('attendance_reviews').insert({
      attendance_id: attendanceId,
      reviewer_id: user.id,
      action: 'approved',
      feedback: feedback
    })
  } catch (err) {
    console.warn('attendance_reviews insert note:', err)
  }

  revalidatePath('/tutor/dashboard')
  revalidatePath('/tutor/attendance')
  revalidatePath('/student/dashboard')
  revalidatePath('/student/attendance')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/analytics')

  return { success: true }
}

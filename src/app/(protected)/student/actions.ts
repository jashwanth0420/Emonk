'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { retrieveQuestion } from '@/lib/attendance/question-retrieval'
import { evaluateAnswer } from '@/lib/ai/evaluate-answer'
import { redirect } from 'next/navigation'

export async function checkInAction(scheduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if existing check-in exists
  const { data: existing } = await adminClient
    .from('attendance')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('schedule_id', scheduleId)
    .maybeSingle()

  if (existing) {
    redirect('/student/attendance')
  }

  // Insert check-in
  const { error } = await adminClient.from('attendance').insert({
    student_id: user.id,
    schedule_id: scheduleId,
    attendance_date: today,
    check_in_at: new Date().toISOString(),
    status: 'checked_in'
  })

  if (error) {
    console.error('Check-in error:', error)
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/student/attendance')
  redirect('/student/attendance')
}

export async function submitTopicsAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const scheduleId = formData.get('schedule_id') as string
  let topicIds = formData.getAll('topics') as string[]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()

  // If student didn't check any topics, default to schedule's topic or first active topic
  if (!topicIds || topicIds.length === 0) {
    const { data: schedule } = await adminClient.from('schedules').select('topic_id').eq('id', scheduleId).single()
    if (schedule?.topic_id) {
      topicIds = [schedule.topic_id]
    } else {
      const { data: fallbackTopic } = await adminClient.from('topics').select('id').limit(1).single()
      if (fallbackTopic) topicIds = [fallbackTopic.id]
    }
  }

  // 1. Create or get learning session
  const { data: sessionData } = await adminClient.from('learning_sessions')
    .insert({
      student_id: user.id,
      attendance_id: attendanceId,
      schedule_id: scheduleId
    })
    .select()
    .single()

  // 2. Associate topics
  if (sessionData && topicIds.length > 0) {
    const studentTopics = topicIds.map(topicId => ({
      learning_session_id: sessionData.id,
      topic_id: topicId,
      student_id: user.id
    }))
    await adminClient.from('student_topics').insert(studentTopics)
  }

  // 3. Assign Question
  const questionId = await retrieveQuestion(topicIds, user.id)

  await adminClient.from('attendance').update({
    status: 'question_assigned',
    question_id: questionId
  }).eq('id', attendanceId)

  revalidatePath('/student/attendance')
  revalidatePath('/student/dashboard')
  redirect('/student/attendance')
}

export async function submitAnswerAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  let questionId = formData.get('question_id') as string
  const answerText = (formData.get('answer') as string)?.trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()

  // Ensure a valid question ID exists
  if (!questionId) {
    const fallbackQId = await retrieveQuestion([], user.id)
    if (fallbackQId) {
      questionId = fallbackQId
      await adminClient.from('attendance').update({ question_id: fallbackQId }).eq('id', attendanceId)
    }
  }

  // 1. Fetch question details for evaluation
  let questionText = 'Explain your concepts and implementations.'
  let expectedConcepts: string[] = ['approach', 'complexity']

  if (questionId) {
    const { data: q } = await adminClient.from('questions').select('question_text, expected_concepts').eq('id', questionId).single()
    if (q) {
      questionText = q.question_text
      expectedConcepts = q.expected_concepts || expectedConcepts
    }
  }

  // 2. Evaluate with Groq AI (with fallback)
  let evaluationResult: any = null
  let evalStatus = 'pending'

  try {
    evaluationResult = await evaluateAnswer(questionText, expectedConcepts, answerText)
    if (evaluationResult) evalStatus = 'evaluated'
  } catch (err) {
    console.warn('AI evaluation warning:', err)
  }

  // 3. Create Question Attempt
  const { data: attempt } = await adminClient.from('question_attempts').insert({
    student_id: user.id,
    question_id: questionId,
    attendance_id: attendanceId,
    answer_text: answerText,
    evaluation_status: evalStatus,
    ai_evaluation: evaluationResult
  }).select().single()

  // 4. Update Attendance Status to pending_review
  await adminClient.from('attendance').update({
    status: 'pending_review',
    question_attempt_id: attempt?.id
  }).eq('id', attendanceId)

  revalidatePath('/student/attendance')
  revalidatePath('/student/dashboard')
  revalidatePath('/student/progress')
  revalidatePath('/tutor/attendance')
  revalidatePath('/tutor/dashboard')

  redirect('/student/attendance')
}

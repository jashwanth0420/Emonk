'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { retrieveQuestion } from '@/lib/attendance/question-retrieval'
import { evaluateAnswer } from '@/lib/ai/evaluate-answer'
import { redirect } from 'next/navigation'

export async function checkInAction(scheduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase.from('attendance').select('id').eq('student_id', user?.id).eq('schedule_id', scheduleId).single()
  if (existing) return { error: "Already checked in" }

  await supabase.from('attendance').insert({
    student_id: user?.id, schedule_id: scheduleId, attendance_date: today, check_in_at: new Date().toISOString(), status: 'checked_in'
  })
  redirect('/student/attendance')
}

export async function submitTopicsAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const scheduleId = formData.get('schedule_id') as string
  const topicIds = formData.getAll('topics') as string[]
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: sessionData } = await supabase.from('learning_sessions')
    .insert({ student_id: user.id, attendance_id: attendanceId, schedule_id: scheduleId })
    .select().single()

  const studentTopics = topicIds.map(topicId => ({
    learning_session_id: sessionData?.id, topic_id: topicId, student_id: user.id
  }))
  await supabase.from('student_topics').insert(studentTopics)

  const questionId = await retrieveQuestion(topicIds, user.id)
  await supabase.from('attendance').update({ status: 'question_assigned', question_id: questionId || null }).eq('id', attendanceId)
  revalidatePath('/student/attendance')
}

export async function submitAnswerAction(formData: FormData) {
  const attendanceId = formData.get('attendance_id') as string
  const questionId = formData.get('question_id') as string
  const answerText = formData.get('answer') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch question details for evaluation
  const { data: question } = await supabase.from('questions').select('question_text, expected_concepts').eq('id', questionId).single()

  // 2. Try to evaluate with Groq (graceful fallback)
  let evaluationResult = null
  let evalStatus = 'pending'
  
  if (question && question.expected_concepts) {
    evaluationResult = await evaluateAnswer(question.question_text, question.expected_concepts, answerText)
    if (evaluationResult) evalStatus = 'evaluated'
  }

  // 3. Create Question Attempt
  const { data: attempt } = await supabase.from('question_attempts').insert({
      student_id: user?.id,
      question_id: questionId,
      attendance_id: attendanceId,
      answer_text: answerText,
      evaluation_status: evalStatus,
      ai_evaluation: evaluationResult
    }).select().single()

  // 4. Update Attendance Status
  await supabase.from('attendance').update({ status: 'pending_review', question_attempt_id: attempt?.id }).eq('id', attendanceId)

  revalidatePath('/student/attendance')
  revalidatePath('/student/dashboard')
}

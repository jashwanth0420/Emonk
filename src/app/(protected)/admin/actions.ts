'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateQuestions } from '@/lib/ai/generate-question'
import { redirect } from 'next/navigation'

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'student' | 'tutor'
  
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authError || !authData.user) return { error: authError?.message || "Failed" }

  await supabase.from('profiles').insert({ id: authData.user.id, email, full_name: fullName, role })
  revalidatePath(`/admin/${role}s`)
  return { success: true }
}

export async function createScheduleAction(formData: FormData) {
  const title = formData.get('title') as string
  const topic_id = formData.get('topic_id') as string
  const date = formData.get('date') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('schedules').insert({
    title, topic_id, date, start_time, end_time, created_by: user?.id
  })
  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function generateQuestionsAction(formData: FormData) {
  const topicId = formData.get('topic_id') as string
  const type = formData.get('type') as string
  const difficulty = formData.get('difficulty') as string
  const count = parseInt(formData.get('count') as string, 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: topic } = await supabase.from('topics').select('name').eq('id', topicId).single()
  if (!topic) return { error: "Topic not found" }

  try {
    const aiResult = await generateQuestions(topic.name, type, difficulty, count)
    
    // Insert generated questions into the bank as pending review
    const inserts = aiResult.questions.map(q => ({
      topic_id: topicId,
      question_text: q.question,
      question_type: q.question_type,
      difficulty: q.difficulty,
      expected_concepts: q.expected_concepts,
      options: q.options || null,
      correct_answer: q.correct_answer || null,
      source: 'ai_generated',
      review_status: 'ai_generated', // Needs admin approval
      is_active: false,
      created_by: user?.id
    }))

    await supabase.from('questions').insert(inserts)
    
    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: user?.id,
      action: 'QUESTION_GENERATED',
      entity_type: 'questions',
      new_data: { count, topic: topic.name }
    })

  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}

export async function reviewGeneratedQuestionAction(formData: FormData) {
  const questionId = formData.get('question_id') as string
  const action = formData.get('action') as 'approve' | 'reject'
  
  const supabase = await createClient()

  if (action === 'approve') {
    await supabase.from('questions').update({ review_status: 'active', is_active: true }).eq('id', questionId)
  } else {
    await supabase.from('questions').update({ review_status: 'rejected', is_active: false }).eq('id', questionId)
  }
  
  revalidatePath('/admin/questions')
}

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateQuestions } from '@/lib/ai/generate-question'
import { redirect } from 'next/navigation'

export async function createUserAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const fullName = (formData.get('fullName') as string)?.trim()
  const role = formData.get('role') as 'student' | 'tutor'
  
  if (!email || !password || !fullName || !role) {
    redirect(`/admin/${role}s?error=${encodeURIComponent('All fields are required')}`)
  }

  const adminClient = createAdminClient()

  // 1. Create User in Supabase Auth via Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  })
  
  if (authError || !authData.user) {
    redirect(`/admin/${role}s?error=${encodeURIComponent(authError?.message || 'Failed to create auth user')}`)
  }

  // 2. Insert Profile using Admin Client to bypass RLS recursion
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role,
    status: 'active'
  })

  if (profileError) {
    redirect(`/admin/${role}s?error=${encodeURIComponent(profileError.message)}`)
  }

  revalidatePath(`/admin/${role}s`)
  redirect(`/admin/${role}s?success=${encodeURIComponent(`${role.toUpperCase()} account created successfully!`)}`)
}

export async function assignStudentToTutorAction(formData: FormData) {
  const studentId = formData.get('student_id') as string
  const tutorId = formData.get('tutor_id') as string

  if (!studentId || !tutorId) {
    redirect(`/admin/students?error=${encodeURIComponent('Please select both a student and a tutor')}`)
  }

  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Upsert assignment
  const { error } = await adminClient.from('tutor_student_assignments').upsert({
    student_id: studentId,
    tutor_id: tutorId,
    assigned_by: user?.id,
    status: 'active'
  }, { onConflict: 'tutor_id,student_id' })

  if (error) {
    redirect(`/admin/students?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/students')
  revalidatePath('/admin/tutors')
  revalidatePath('/tutor/students')
  revalidatePath('/tutor/dashboard')
  redirect(`/admin/students?success=${encodeURIComponent('Student successfully assigned to tutor!')}`)
}

export async function unassignStudentAction(formData: FormData) {
  const assignmentId = formData.get('assignment_id') as string

  const adminClient = createAdminClient()
  await adminClient.from('tutor_student_assignments').delete().eq('id', assignmentId)

  revalidatePath('/admin/students')
  revalidatePath('/admin/tutors')
  revalidatePath('/tutor/students')
  redirect(`/admin/students?success=${encodeURIComponent('Assignment removed.')}`)
}

export async function createTopicAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!name || !category) {
    redirect(`/admin/topics?error=${encodeURIComponent('Name and category are required')}`)
  }

  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await adminClient.from('topics').insert({
    name,
    category,
    description: description || null,
    is_active: true,
    created_by: user?.id
  })

  if (error) {
    redirect(`/admin/topics?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/topics')
  revalidatePath('/admin/schedules')
  redirect(`/admin/topics?success=${encodeURIComponent('Topic created successfully!')}`)
}

export async function createScheduleAction(formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const topic_id = formData.get('topic_id') as string
  const date = formData.get('date') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string

  if (!title || !date || !start_time || !end_time) {
    redirect(`/admin/schedules?error=${encodeURIComponent('Please fill all required fields')}`)
  }

  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await adminClient.from('schedules').insert({
    title,
    topic_id: topic_id || null,
    date,
    start_time,
    end_time,
    status: 'active',
    created_by: user?.id
  })

  if (error) {
    redirect(`/admin/schedules?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/schedules')
  revalidatePath('/student/dashboard')
  redirect(`/admin/schedules?success=${encodeURIComponent('Schedule created successfully!')}`)
}

export async function createQuestionAction(formData: FormData) {
  const topicId = formData.get('topic_id') as string
  const questionText = (formData.get('question_text') as string)?.trim()
  const questionType = formData.get('question_type') as string
  const difficulty = formData.get('difficulty') as string
  const expectedConceptsStr = (formData.get('expected_concepts') as string)?.trim()

  if (!topicId || !questionText || !questionType || !difficulty) {
    redirect(`/admin/questions?error=${encodeURIComponent('Please fill all required fields')}`)
  }

  const expectedConcepts = expectedConceptsStr 
    ? expectedConceptsStr.split(',').map(s => s.trim()).filter(Boolean)
    : [questionType]

  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await adminClient.from('questions').insert({
    topic_id: topicId,
    question_text: questionText,
    question_type: questionType,
    difficulty,
    expected_concepts: expectedConcepts,
    source: 'manual',
    review_status: 'active',
    is_active: true,
    created_by: user?.id
  })

  if (error) {
    redirect(`/admin/questions?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/questions')
  redirect(`/admin/questions?success=${encodeURIComponent('Question added to bank successfully!')}`)
}

export async function generateQuestionsAction(formData: FormData) {
  const topicId = formData.get('topic_id') as string
  const type = (formData.get('type') as string) || 'conceptual'
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const count = parseInt(formData.get('count') as string, 10) || 2
  const customPrompt = (formData.get('custom_prompt') as string) || ''

  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: topic } = await adminClient.from('topics').select('name').eq('id', topicId).single()
  
  if (!topic) {
    redirect(`/admin/ai?error=${encodeURIComponent('Please select a curriculum topic')}`)
  }

  try {
    const aiResult = await generateQuestions(topic.name, type, difficulty, count, customPrompt)
    
    // Insert generated questions into the bank
    const inserts = aiResult.questions.map(q => ({
      topic_id: topicId,
      question_text: q.question,
      question_type: q.question_type || type,
      difficulty: q.difficulty || difficulty,
      expected_concepts: q.expected_concepts || [topic.name],
      options: q.options || null,
      correct_answer: q.correct_answer || null,
      source: 'ai_generated',
      review_status: 'ai_generated',
      is_active: false,
      created_by: user?.id
    }))

    await adminClient.from('questions').insert(inserts)
    
    // Audit log
    await adminClient.from('audit_logs').insert({
      actor_id: user?.id,
      action: 'QUESTION_GENERATED',
      entity_type: 'questions',
      new_data: { count, topic: topic.name }
    })

    revalidatePath('/admin/questions')
  } catch (error: any) {
    redirect(`/admin/ai?error=${encodeURIComponent(error.message || 'AI service unavailable')}`)
  }

  redirect(`/admin/questions?success=${encodeURIComponent(`Successfully generated ${count} questions! Review and approve them below.`)}`)
}

export async function reviewGeneratedQuestionAction(formData: FormData) {
  const questionId = formData.get('question_id') as string
  const action = formData.get('action') as 'approve' | 'reject'
  
  const adminClient = createAdminClient()

  if (action === 'approve') {
    await adminClient.from('questions').update({ review_status: 'active', is_active: true }).eq('id', questionId)
  } else {
    await adminClient.from('questions').update({ review_status: 'rejected', is_active: false }).eq('id', questionId)
  }
  
  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}

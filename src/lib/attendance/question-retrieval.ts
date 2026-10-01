import { createClient } from '@/lib/supabase/server'

export async function retrieveQuestion(topicIds: string[], studentId: string) {
  const supabase = await createClient()

  // Find all active questions for the selected topics
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id')
    .in('topic_id', topicIds)
    .eq('is_active', true)
    .eq('review_status', 'active')

  if (error || !questions || questions.length === 0) return null

  // Find questions the student has already attempted
  const { data: attempts } = await supabase
    .from('question_attempts')
    .select('question_id')
    .eq('student_id', studentId)

  const attemptedIds = new Set(attempts?.map(a => a.question_id) || [])

  // Filter out attempted questions
  let availableQuestions = questions.filter(q => !attemptedIds.has(q.id))

  // Fallback: If they've answered all questions, just give them any active one
  if (availableQuestions.length === 0) {
    availableQuestions = questions
  }

  // Randomly select one
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  return availableQuestions[randomIndex].id
}

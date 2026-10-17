import { createAdminClient } from '@/lib/supabase/admin'

export async function retrieveQuestion(topicIds: string[], studentId: string): Promise<string | null> {
  const adminClient = createAdminClient()

  // 1. Try to find active questions matching the student's selected topics
  let query = adminClient
    .from('questions')
    .select('id, question_text, expected_concepts')
    .eq('is_active', true)
    .eq('review_status', 'active')

  if (topicIds && topicIds.length > 0) {
    query = query.in('topic_id', topicIds)
  }

  const { data: topicQuestions } = await query
  let available = topicQuestions || []

  // 2. If no questions exist for these specific topics, fall back to ANY active question
  if (available.length === 0) {
    const { data: allActiveQuestions } = await adminClient
      .from('questions')
      .select('id, question_text, expected_concepts')
      .eq('is_active', true)
      .eq('review_status', 'active')
    available = allActiveQuestions || []
  }

  // 3. Filter out questions already attempted by this student if possible
  if (available.length > 1 && studentId) {
    const { data: attempts } = await adminClient
      .from('question_attempts')
      .select('question_id')
      .eq('student_id', studentId)

    const attemptedIds = new Set(attempts?.map((a: any) => a.question_id) || [])
    const unattempted = available.filter(q => !attemptedIds.has(q.id))
    if (unattempted.length > 0) {
      available = unattempted
    }
  }

  // 4. Fallback: If bank is completely empty, auto-create a standard concept question so flow NEVER breaks
  if (available.length === 0) {
    const { data: topic } = await adminClient.from('topics').select('id, name').limit(1).single()
    if (topic) {
      const { data: newQ } = await adminClient.from('questions').insert({
        topic_id: topic.id,
        question_text: `Explain the key concepts, algorithm logic, and edge cases you implemented during today's session on ${topic.name}.`,
        question_type: 'conceptual',
        difficulty: 'medium',
        expected_concepts: ['logic', 'complexity', 'edge cases'],
        source: 'manual',
        review_status: 'active',
        is_active: true
      }).select().single()

      if (newQ) return newQ.id
    }
  }

  if (available.length === 0) return null

  // Random pick
  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex].id
}

import { z } from 'zod'

export const GeneratedQuestionSchema = z.object({
  question: z.string(),
  question_type: z.enum(['coding', 'scenario', 'conceptual', 'debugging', 'multiple_choice', 'short_answer']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  expected_concepts: z.array(z.string()),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
})

export const GeneratedQuestionsListSchema = z.object({
  questions: z.array(GeneratedQuestionSchema)
})

export const AnswerEvaluationSchema = z.object({
  relevance: z.number().min(0).max(1),
  concepts_covered: z.array(z.string()),
  missing_concepts: z.array(z.string()),
  feedback: z.string(),
})

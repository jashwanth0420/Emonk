import { z } from 'zod'

export const GeneratedQuestionSchema = z.object({
  question: z.string().min(1),
  question_type: z.preprocess(
    (val) => typeof val === 'string' ? val.toLowerCase().trim() : 'conceptual',
    z.enum(['coding', 'scenario', 'conceptual', 'debugging', 'multiple_choice', 'short_answer']).catch('conceptual')
  ),
  difficulty: z.preprocess(
    (val) => typeof val === 'string' ? val.toLowerCase().trim() : 'medium',
    z.enum(['easy', 'medium', 'hard']).catch('medium')
  ),
  expected_concepts: z.preprocess(
    (val) => {
      if (Array.isArray(val)) return val.map(v => String(v));
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    },
    z.array(z.string()).default([])
  ),
  options: z.preprocess(
    (val) => Array.isArray(val) ? val.map(v => String(v)) : undefined,
    z.array(z.string()).optional()
  ),
  correct_answer: z.preprocess(
    (val) => (val === null || val === undefined) ? undefined : String(val),
    z.string().optional()
  ),
})

export const GeneratedQuestionsListSchema = z.preprocess((val) => {
  if (Array.isArray(val)) return { questions: val }
  if (val && typeof val === 'object') {
    const obj = val as Record<string, any>
    if (Array.isArray(obj.questions)) return val
    const firstArray = Object.values(obj).find(v => Array.isArray(v))
    if (firstArray) return { questions: firstArray }
  }
  return val
}, z.object({
  questions: z.array(GeneratedQuestionSchema).min(1)
}))

export const AnswerEvaluationSchema = z.object({
  relevance: z.preprocess(
    (val) => {
      const num = Number(val)
      if (isNaN(num)) return 0.5
      return num > 1 ? num / 100 : num
    },
    z.number().min(0).max(1)
  ),
  concepts_covered: z.preprocess(
    (val) => Array.isArray(val) ? val.map(v => String(v)) : [],
    z.array(z.string()).default([])
  ),
  missing_concepts: z.preprocess(
    (val) => Array.isArray(val) ? val.map(v => String(v)) : [],
    z.array(z.string()).default([])
  ),
  feedback: z.string().default('Evaluation completed.'),
})

import { aiChat } from './client'
import { EVALUATION_SYSTEM } from './prompts'
import { AnswerEvaluationSchema } from './schemas'

export async function evaluateAnswer(question: string, expectedConcepts: string[], studentAnswer: string) {
  const userPrompt = `Evaluate the following student answer.

Question: ${question}
Expected Concepts: ${expectedConcepts.join(', ')}

Student Answer:
${studentAnswer}

Required JSON Schema:
{
  "relevance": 0.0,
  "concepts_covered": ["concept1"],
  "missing_concepts": ["concept2"],
  "feedback": "Short feedback"
}`

  const rawJson = await aiChat(EVALUATION_SYSTEM, userPrompt, 0.3, true)
  
  try {
    const parsed = JSON.parse(rawJson)
    return AnswerEvaluationSchema.parse(parsed)
  } catch (err) {
    console.error("Failed to parse AI evaluation output", err)
    return null
  }
}

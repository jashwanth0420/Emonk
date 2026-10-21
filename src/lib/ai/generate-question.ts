import { aiChat } from './client'
import { QUESTION_GENERATOR_SYSTEM } from './prompts'
import { GeneratedQuestionsListSchema } from './schemas'

export async function generateQuestions(
  topic: string,
  type: string,
  difficulty: string,
  count: number = 3,
  customPrompt?: string
) {
  const instructions = customPrompt && customPrompt.trim().length > 0
    ? `\nSpecific Admin Guidance/Focus Prompt:\n"${customPrompt.trim()}"\n`
    : ''

  const userPrompt = `Generate ${count} ${difficulty}-level questions about "${topic}" of type "${type}".
${instructions}
Focus on clear, high-quality assessment questions tailored to evaluate real student understanding.

Required JSON Schema:
{
  "questions": [
    {
      "question": "string",
      "question_type": "${type}",
      "difficulty": "${difficulty}",
      "expected_concepts": ["concept1", "concept2"],
      "options": ["opt1", "opt2"],
      "correct_answer": "string"
    }
  ]
}`

  const rawJson = await aiChat(QUESTION_GENERATOR_SYSTEM, userPrompt, 0.7, true)
  
  try {
    const parsed = JSON.parse(rawJson)
    return GeneratedQuestionsListSchema.parse(parsed)
  } catch (err) {
    console.error("Failed to parse AI question output", err)
    throw new Error("Invalid AI generation output")
  }
}

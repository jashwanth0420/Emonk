import Groq from 'groq-sdk'

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not set.")
    return null
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export async function aiChat(systemPrompt: string, userPrompt: string, temperature = 0.7, jsonMode = true) {
  const groq = getGroqClient()
  if (!groq) throw new Error("AI service not configured (missing GROQ_API_KEY).")

  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" }
    })
    return response.choices[0]?.message?.content || '{}'
  } catch (error) {
    console.error("Groq API Error:", error)
    throw new Error("AI service unavailable")
  }
}

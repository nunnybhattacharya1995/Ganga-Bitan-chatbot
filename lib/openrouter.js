import axios from 'axios'
import { getSystemPrompt } from './systemPrompt'

export async function getAIReply(messages, language) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',   // faster than 3.5-haiku, same quality for booking
        messages: [
          { role: 'system', content: getSystemPrompt(language) },
          ...messages.slice(-10)             // last 10 messages only (was 20) — faster DB + faster AI
        ],
        max_tokens: 300,                     // was 500 — booking replies are short, 300 is plenty
        temperature: 0.3                     // lower = more focused, less thinking time
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gangabitanfamilyinn.com',
          'X-Title': 'Ganga Bitan Booking Bot'
        }
      }
    )
    return response.data.choices[0].message.content
  } catch (err) {
    console.error('OpenRouter error:', err?.response?.data || err.message)
    return 'Sorry, I am having trouble responding right now. Please try again in a moment.'
  }
}

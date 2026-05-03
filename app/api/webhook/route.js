import { supabase } from '@/lib/supabase'
import { sendMessage, sendButtonMessage, sendListMessage, sendImageMessage } from '@/lib/whatsapp'
import { getAIReply } from '@/lib/openrouter'
import { detectRoomMention, isImageReady } from '@/lib/roomImages'

export const dynamic = 'force-dynamic'

// ── Language detection ────────────────────────────────────────────────────────
function detectLanguageChoice(text) {
  const t = (text || '').trim().toLowerCase()
  if (t === '1' || t.includes('english') || t === 'lang_english') return 'english'
  if (
    t === '2' ||
    t.includes('bengali') ||
    t.includes('bangla') ||
    t.includes('বাংলা') ||
    t === 'lang_bengali'
  )
    return 'bengali'
  return null
}

// ── Booking completion detection ──────────────────────────────────────────────
function isBookingComplete(text) {
  if (!text) return false
  const t = text.toLowerCase()
  return (
    t.includes('booking request has been received') ||
    t.includes('বুকিং অনুরোধ পাওয়া গেছে') ||
    t.includes('team will contact you')
  )
}

// ── Parse numbered options from AI text ──────────────────────────────────────
// Returns { body, options: [{ num, title }] }
function parseInteractive(text) {
  const lines = text.split('\n')
  const options = []
  const bodyLines = []
  let optionStarted = false

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)[.)]\s+(.+)/)
    if (match) {
      options.push({
        num: match[1],
        title: match[2].replace(/\*|_|~/g, '').trim()
      })
      optionStarted = true
    } else {
      if (!optionStarted) bodyLines.push(line)
    }
  }

  const body = bodyLines.join('\n').trim() || text
  return { body, options }
}

// ── Send AI reply — auto-convert numbered options to buttons/list ─────────────
async function sendAIReply(phone, aiReply) {
  const { body, options } = parseInteractive(aiReply)

  if (
    options.length >= 2 &&
    options.length <= 3 &&
    options.every((o) => o.title.length <= 20)
  ) {
    // 2–3 short options → clickable buttons
    await sendButtonMessage(
      phone,
      body,
      options.map((o, i) => ({ id: `opt_${i + 1}`, title: o.title }))
    )
  } else if (options.length >= 2 && options.length <= 10) {
    // 4–10 options → scrollable list
    await sendListMessage(
      phone,
      body,
      options.map((o, i) => ({ id: `opt_${i + 1}`, title: o.title }))
    )
  } else {
    // No detected options (name step, summary, etc.) → plain text
    await sendMessage(phone, aiReply)
  }
}

// ── Webhook GET — Meta verification ──────────────────────────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// ── Webhook POST — incoming messages ─────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json()
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message) return new Response('OK', { status: 200 })

    // Accept text AND interactive (button/list reply) messages
    if (!['text', 'interactive'].includes(message.type)) {
      return new Response('OK', { status: 200 })
    }

    const phone = message.from
    const waMessageId = message.id

    // Extract text from either a typed message or a button/list click
    let text = ''
    if (message.type === 'text') {
      text = message.text?.body || ''
    } else if (message.type === 'interactive') {
      const ir = message.interactive
      text = ir?.button_reply?.title || ir?.list_reply?.title || ''
    }

    // ── Deduplication ─────────────────────────────────────────────────────────
    if (waMessageId) {
      const { data: existing, error: dupErr } = await supabase
        .from('conversations')
        .select('id')
        .eq('wa_message_id', waMessageId)
        .maybeSingle()
      if (dupErr) console.error('[dedupe error]', dupErr.message)
      if (existing) {
        console.log('[dedupe] skipping already-processed message', waMessageId)
        return new Response('OK', { status: 200 })
      }
    }

    // ── Agent mode check ──────────────────────────────────────────────────────
    const { data: modeRow, error: modeErr } = await supabase
      .from('agent_mode')
      .select('is_human')
      .eq('phone', phone)
      .maybeSingle()
    if (modeErr) console.error('[agent_mode error]', modeErr.message)

    if (modeRow?.is_human) {
      const { error: e } = await supabase.from('conversations').insert({
        phone,
        role: 'user',
        message: text,
        wa_message_id: waMessageId
      })
      if (e) console.error('[conversations insert error]', e.message)
      return new Response('OK', { status: 200 })
    }

    // ── Get or create guest ───────────────────────────────────────────────────
    const { data: upsertedGuest, error: upsertErr } = await supabase
      .from('guests')
      .upsert({ phone }, { onConflict: 'phone', ignoreDuplicates: false })
      .select()
      .single()
    if (upsertErr) console.error('[guests upsert error]', upsertErr.message)

    let guest = upsertedGuest
    if (!guest) {
      const { data: refetched } = await supabase
        .from('guests')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()
      guest = refetched
    }

    if (!guest) {
      console.error('[guest unavailable] Run the SQL in lib/supabase.js first.')
      return new Response('OK', { status: 200 })
    }

    const isFirstContact = !guest.language

    // ── Save inbound user message ─────────────────────────────────────────────
    const { error: userMsgErr } = await supabase.from('conversations').insert({
      phone,
      role: 'user',
      message: text,
      wa_message_id: waMessageId
    })
    if (userMsgErr) console.error('[user msg insert error]', userMsgErr.message)

    // ── First contact: show language picker as interactive buttons ────────────
    if (isFirstContact) {
      const detectedLang = detectLanguageChoice(text)
      if (detectedLang) {
        await supabase.from('guests').update({ language: detectedLang }).eq('phone', phone)
        guest.language = detectedLang
        // Fall through to AI reply
      } else {
        await supabase
          .from('agent_mode')
          .upsert({ phone, is_human: false, updated_at: new Date().toISOString() })

        const welcomeMsg =
          'Welcome to *Ganga Bitan Family Inn* 🌿\nA luxury riverside resort on the Ganges.\n\nPlease choose your preferred language:'

        await supabase.from('conversations').insert({
          phone,
          role: 'assistant',
          message: welcomeMsg
        })

        // Send as 2 clickable buttons
        await sendButtonMessage(phone, welcomeMsg, [
          { id: 'lang_english', title: 'English' },
          { id: 'lang_bengali', title: 'বাংলা (Bengali)' }
        ])

        return new Response('OK', { status: 200 })
      }
    }

    // ── Build conversation history and get AI reply ───────────────────────────
    const { data: historyDesc } = await supabase
      .from('conversations')
      .select('role, message')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20)

    const history = (historyDesc || [])
      .reverse()
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.message
      }))

    const aiReply = await getAIReply(history, guest.language)

    await supabase.from('conversations').insert({
      phone,
      role: 'assistant',
      message: aiReply
    })

    // Send as interactive buttons/list if numbered options detected, else plain text
    await sendAIReply(phone, aiReply)

    // ── Send room image if a specific room is mentioned ───────────────────────
    const roomMentioned = detectRoomMention(aiReply) || detectRoomMention(text)
    if (roomMentioned && isImageReady(roomMentioned)) {
      await sendImageMessage(phone, roomMentioned.url, roomMentioned.caption)
    }

    // ── Owner notification on booking completion ──────────────────────────────
    if (isBookingComplete(aiReply)) {
      const owner = process.env.OWNER_WHATSAPP_NUMBER
      if (owner) {
        const notice = `🔔 New booking request received!\n\nGuest phone: +${phone}\nGuest name: ${guest.name || '(not set)'}\n\nPlease check the dashboard for full details.`
        await sendMessage(owner, notice)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err?.message || err)
    return new Response('OK', { status: 200 })
  }
}

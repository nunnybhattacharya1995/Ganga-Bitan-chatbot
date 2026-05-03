import axios from 'axios'

const BASE_URL = () =>
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

const HEADERS = () => ({
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
})

// Plain text message
export async function sendMessage(to, message) {
  try {
    await axios.post(
      BASE_URL(),
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      },
      { headers: HEADERS() }
    )
  } catch (err) {
    console.error('WhatsApp send error:', err?.response?.data || err.message)
  }
}

// Clickable button message — up to 3 buttons, each title max 20 chars
// buttons = [{ id: 'btn_1', title: 'English' }, ...]
export async function sendButtonMessage(to, bodyText, buttons, footerText = '') {
  try {
    await axios.post(
      BASE_URL(),
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          ...(footerText && { footer: { text: footerText } }),
          action: {
            buttons: buttons.slice(0, 3).map((b) => ({
              type: 'reply',
              reply: { id: String(b.id), title: String(b.title).slice(0, 20) }
            }))
          }
        }
      },
      { headers: HEADERS() }
    )
  } catch (err) {
    console.error('WhatsApp button send error:', err?.response?.data || err.message)
    // Fallback to plain text so user always gets a reply
    await sendMessage(to, bodyText)
  }
}

// Scrollable list message — up to 10 rows
// rows = [{ id: 'row_1', title: 'Room Name', description: '2 Adults' }, ...]
export async function sendListMessage(
  to,
  bodyText,
  rows,
  buttonLabel = 'View Options',
  footerText = ''
) {
  try {
    await axios.post(
      BASE_URL(),
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: bodyText },
          ...(footerText && { footer: { text: footerText } }),
          action: {
            button: String(buttonLabel).slice(0, 20),
            sections: [
              {
                title: 'Options',
                rows: rows.slice(0, 10).map((r) => ({
                  id: String(r.id),
                  title: String(r.title).slice(0, 24),
                  ...(r.description && {
                    description: String(r.description).slice(0, 72)
                  })
                }))
              }
            ]
          }
        }
      },
      { headers: HEADERS() }
    )
  } catch (err) {
    console.error('WhatsApp list send error:', err?.response?.data || err.message)
    // Fallback to plain text
    await sendMessage(to, bodyText)
  }
}

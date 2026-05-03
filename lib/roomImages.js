// ─────────────────────────────────────────────────────────────────────────────
// ROOM IMAGE URLs — replace each placeholder with your actual public image URL
// Upload your photos to Google Drive (public link), Cloudinary, or any CDN.
// Each URL must be a direct image link ending in .jpg / .jpeg / .png
// ─────────────────────────────────────────────────────────────────────────────

export const ROOM_IMAGES = {
  'aparupa ground': {
    label: 'Aparupa (Ground Floor)',
    url: 'https://your-image-host.com/aparupa-ground.jpg',
    caption: '🏡 Aparupa (Ground Floor) — 4 Adults + 2 Children\nSpacious four-bedded family room with natural light and warm interiors.'
  },
  'aparupa first': {
    label: 'Aparupa (First Floor)',
    url: 'https://your-image-host.com/aparupa-first.jpg',
    caption: '🌊 Aparupa (First Floor) — 2 Adults + 1 Child\n160 sq ft terrace with 180° Ganges view.'
  },
  'apsaraa': {
    label: 'Apsaraa',
    url: 'https://your-image-host.com/apsaraa.jpg',
    caption: '🌿 Apsaraa — 2 Adults + 1 Child\nRiver-facing room with modern comfort.'
  },
  'avisaar': {
    label: 'Avisaar (Private Terrace)',
    url: 'https://your-image-host.com/avisaar.jpg',
    caption: '✨ Avisaar — 2 Adults + 2 Children\nPrivate terrace with sunset views over the river.'
  },
  'abhilasha': {
    label: 'Abhilasha (Family Room)',
    url: 'https://your-image-host.com/abhilasha.jpg',
    caption: '🏊 Abhilasha — 4 Adults + 2 Children\nMost spacious — private deck, infinity pool with 2 loungers, Ganges view.'
  },
  'ananya': {
    label: 'Ananya (Family Room)',
    url: 'https://your-image-host.com/ananya.jpg',
    caption: '🏡 Ananya — 2 Adults + 1 Child\nClassic charm with modern elegance.'
  }
}

// Detect which room is being mentioned in an AI reply or user message
export function detectRoomMention(text) {
  if (!text) return null
  const t = text.toLowerCase()

  if (t.includes('aparupa') && (t.includes('first') || t.includes('1st') || t.includes('floor'))) {
    // Be specific — if both ground and first mentioned, pick most relevant
    if (t.includes('ground')) return ROOM_IMAGES['aparupa ground']
    return ROOM_IMAGES['aparupa first']
  }
  if (t.includes('aparupa')) return ROOM_IMAGES['aparupa ground']
  if (t.includes('apsaraa') || t.includes('apsara')) return ROOM_IMAGES['apsaraa']
  if (t.includes('avisaar') || t.includes('avisar')) return ROOM_IMAGES['avisaar']
  if (t.includes('abhilasha')) return ROOM_IMAGES['abhilasha']
  if (t.includes('ananya')) return ROOM_IMAGES['ananya']

  return null
}

// Returns true if the image URL has been set (not a placeholder)
export function isImageReady(room) {
  return room?.url && !room.url.includes('your-image-host.com')
}

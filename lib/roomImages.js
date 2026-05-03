// Room data sourced from https://www.gangabitanfamilyinn.com
// Images are served directly from Wix CDN — no hosting needed

export const ROOM_IMAGES = {
  'aparupa ground': {
    label: 'Aparupa (Ground Floor)',
    url: 'https://static.wixstatic.com/media/c1ea5b_d1231b2e60ae4dd0bc32e084d472e112~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_d1231b2e60ae4dd0bc32e084d472e112~mv2.jpg',
    caption: '🏡 *Aparupa (Ground Floor)*\n\n👥 Capacity: 4 Adults + 2 Children (up to 6 yrs)\n(+2 additional adults with extra charges)\n\n✨ Spacious four-bedded family room with natural light, warm interiors, pool & garden access.\n\n🍳 Complimentary breakfast included'
  },
  'aparupa first': {
    label: 'Aparupa (First Floor)',
    url: 'https://static.wixstatic.com/media/c1ea5b_881cd2192d184fd9a557dbd4a2c595ad~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_881cd2192d184fd9a557dbd4a2c595ad~mv2.jpg',
    caption: '🌊 *Aparupa (First Floor)*\n\n👥 Capacity: 2 Adults + 1 Child (up to 6 yrs)\n(+1 additional adult with extra charges)\n\n✨ King size bed + sofa cum bed\n🏠 160 sq ft private terrace (up to 10 people)\n👁️ 3-sided 180° Ganges view + extra toilet\n\n🍳 Complimentary breakfast included'
  },
  'apsaraa': {
    label: 'Apsara (Ground & First Floor)',
    url: 'https://static.wixstatic.com/media/c1ea5b_23a6ec28468445328289e61c214ba1cf~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_23a6ec28468445328289e61c214ba1cf~mv2.jpg',
    caption: '🌿 *Apsara (Ground & First Floor)*\n\n👥 Capacity: 2 Adults + 1 Child (up to 6 yrs)\n(+1 additional adult with extra charges)\n\n✨ King size bed + sofa cum bed\n🌊 River-facing with 180° Ganges view\n🏠 160 sq ft terrace + extra toilet\n\n🍳 Complimentary breakfast included'
  },
  'avisaar': {
    label: 'Avisaar (With Private Terrace)',
    url: 'https://static.wixstatic.com/media/c1ea5b_670a6ad591984b87b963dda6c5aa0f95~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_670a6ad591984b87b963dda6c5aa0f95~mv2.jpg',
    caption: '✨ *Avisaar (With Private Terrace)*\n\n👥 Capacity: 2 Adults + 1 Child (up to 6 yrs)\n(+1 additional adult with extra charges)\n\n🏡 Curated private terrace with sunset river views\n🛏️ Luxurious king-size bed with premium bedding\n🌅 Perfect for romantic escapes\n\n🍳 Complimentary breakfast included'
  },
  'abhilasha': {
    label: 'Abhilasha (Family Room)',
    url: 'https://static.wixstatic.com/media/c1ea5b_49d7b5234d1c4b8483d21e04d1a3a91b~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_49d7b5234d1c4b8483d21e04d1a3a91b~mv2.jpg',
    caption: '🏊 *Abhilasha (Family Room)*\n\n👥 Capacity: 4 Adults + 2 Children (up to 6 yrs)\n\n✨ Most spacious & luxurious family room\n🏡 Private deck with Ganges view\n🏊 Infinity pool with 2 sun loungers\n🍽️ Separate dining & lounge area\n\n🍳 Complimentary breakfast included'
  },
  'ananya': {
    label: 'Ananya (Family Room)',
    url: 'https://static.wixstatic.com/media/c1ea5b_77dc0ef431984c21b5fa7a21a8c540a2~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_90,enc_avif,quality_auto/c1ea5b_77dc0ef431984c21b5fa7a21a8c540a2~mv2.jpg',
    caption: '🏡 *Ananya (Family Room)*\n\n👥 Capacity: 2 Adults + 1 Child (up to 6 yrs)\n(+1 additional adult with extra charges)\n\n✨ Classic charm with modern elegance\n🌊 Large balcony with panoramic Ganges views\n🛏️ King-size bed + sofa cum bed\n\n🍳 Complimentary breakfast included'
  }
}

// Detect which room is mentioned in any text
export function detectRoomMention(text) {
  if (!text) return null
  const t = text.toLowerCase()

  // Aparupa — check floor first before generic match
  if (t.includes('aparupa')) {
    if (t.includes('first') || t.includes('1st')) return ROOM_IMAGES['aparupa first']
    if (t.includes('ground')) return ROOM_IMAGES['aparupa ground']
    // Generic aparupa — default to ground floor
    return ROOM_IMAGES['aparupa ground']
  }
  if (t.includes('apsaraa') || t.includes('apsara')) return ROOM_IMAGES['apsaraa']
  if (t.includes('avisaar') || t.includes('avisar')) return ROOM_IMAGES['avisaar']
  if (t.includes('abhilasha')) return ROOM_IMAGES['abhilasha']
  if (t.includes('ananya')) return ROOM_IMAGES['ananya']

  return null
}

// All images are live — always ready
export function isImageReady() {
  return true
}

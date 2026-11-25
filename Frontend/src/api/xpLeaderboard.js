import { apiRequest } from './client'

const demoScores = [
  { user_id: 1, display_name: 'Mila', total_xp: 320 },
  { user_id: 2, display_name: 'Alex', total_xp: 260 },
  { user_id: 3, display_name: 'Noah', total_xp: 260 },
  { user_id: 4, display_name: 'Robin', total_xp: 180 },
]

function nonnegativeInteger(value) {
  // PostgreSQL can return integer aggregates as decimal strings.
  const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid XP leaderboard entry')
  return number
}

function rankScores(scores) {
  if (!Array.isArray(scores)) throw new Error('Invalid XP leaderboard')
  const ids = new Set()
  const rows = scores.map((score) => {
    const id = nonnegativeInteger(score?.user_id)
    const name = score.display_name
    if (!id || ids.has(id) || typeof name !== 'string' || !name.trim()) {
      throw new Error('Invalid XP leaderboard entry')
    }
    ids.add(id)
    return { id, name: name.trim(), xp: nonnegativeInteger(score.total_xp) }
  })
  rows.sort((a, b) => b.xp - a.xp)
  let rank = 0
  return rows.map((row, index) => {
    if (index === 0 || row.xp !== rows[index - 1].xp) rank = index + 1
    return { ...row, rank }
  })
}

export async function loadXpLeaderboard({ path = import.meta.env.VITE_XP_LEADERBOARD_PATH, ...options } = {}) {
  const endpoint = path?.trim()
  if (!endpoint) return { source: 'demo', rows: rankScores(demoScores) }
  const scores = await apiRequest(endpoint.startsWith('/') ? endpoint : '/' + endpoint, options)
  return { source: 'live', rows: rankScores(scores) }
}

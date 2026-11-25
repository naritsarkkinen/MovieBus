import { afterEach, expect, it, vi } from 'vitest'
import { loadXpLeaderboard } from '../../src/api/xpLeaderboard'

const path = '/rankings/xp'
const row = { user_id: 1, display_name: 'Mila', total_xp: 0 }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('identifies demo scores without requesting live data', async () => {
  vi.stubEnv('VITE_XP_LEADERBOARD_PATH', '')
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const result = await loadXpLeaderboard()
  expect(result.source).toBe('demo')
  expect(result.rows.length).toBeGreaterThan(0)
  expect(fetch).not.toHaveBeenCalled()
})

it('ranks all live scores, preserves ties and keeps users with zero XP', async () => {
  const scores = [
    row,
    { user_id: '2', display_name: 'Alex', total_xp: 300 },
    { user_id: 3, display_name: 'Noah', total_xp: '300' },
  ]
  vi.stubEnv('VITE_XP_LEADERBOARD_PATH', path)
  const fetch = vi.fn().mockResolvedValue(Response.json(scores))
  vi.stubGlobal('fetch', fetch)
  const result = await loadXpLeaderboard()
  expect(fetch).toHaveBeenCalledWith('/api' + path, expect.objectContaining({ method: 'GET' }))
  expect(result).toEqual({
    source: 'live',
    rows: [
      { id: 2, name: 'Alex', xp: 300, rank: 1 },
      { id: 3, name: 'Noah', xp: 300, rank: 1 },
      { id: 1, name: 'Mila', xp: 0, rank: 3 },
    ],
  })
})

it('preserves a live empty leaderboard', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([])))
  await expect(loadXpLeaderboard({ path })).resolves.toEqual({ source: 'live', rows: [] })
})

it.for([
  { rows: {} },
  [row, row],
  [{ ...row, display_name: '' }],
  [{ ...row, total_xp: null }],
  [{ ...row, total_xp: ' ' }],
  [{ ...row, total_xp: -5 }],
])('rejects invalid live rankings', async (payload) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(payload)))
  await expect(loadXpLeaderboard({ path })).rejects.toThrow('Invalid XP leaderboard')
})

it('reports API errors from the configured leaderboard', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Unavailable' }, { status: 503 })))
  await expect(loadXpLeaderboard({ path })).rejects.toMatchObject({ status: 503 })
})

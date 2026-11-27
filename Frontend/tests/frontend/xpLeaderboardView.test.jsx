// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import MovieVersePage from '../../src/pages/MovieVersePage'

let container
let root
let xpResponse

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubEnv('VITE_XP_LEADERBOARD_PATH', '')
  xpResponse = vi.fn()
  vi.stubGlobal('fetch', async (path) => {
    if (path === '/api/leaderboards/xp') return xpResponse()
    if (path === '/api/movies' || path === '/api/communities') return Response.json([])
    throw new Error('Unexpected request ' + path)
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

async function openLeaderboard() {
  const opener = container.querySelector('button[aria-label="XP leaderboard"]')
  opener.focus()
  await act(async () => opener.click())
  return container.querySelector('dialog[open]')
}

it('opens demo scores from the HUD and returns to the friends panel with Escape', async () => {
  await act(async () => root.render(<MovieVersePage />))
  act(() => container.querySelector('[aria-label="Friends"]').click())
  const dialog = await openLeaderboard()
  expect(dialog.querySelector('h2').textContent).toBe('XP leaderboard')
  expect(dialog.textContent).toContain('Demo scores')
  const rows = [...dialog.querySelectorAll('tbody tr')]
  expect(rows.length).toBeGreaterThan(0)
  expect(rows[0].querySelector('th[scope="row"]').textContent).toBe('Mila')
  const close = dialog.querySelector('button[aria-label="Close"]')
  expect(document.activeElement).toBe(close)
  act(() => close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(container.querySelector('dialog')).toBeNull()
  expect(container.querySelector('.friends-panel')).toBeTruthy()
  expect(document.activeElement.getAttribute('aria-label')).toBe('XP leaderboard')
})

it('retries an unavailable live leaderboard and displays a live empty result', async () => {
  vi.stubEnv('VITE_XP_LEADERBOARD_PATH', '/leaderboards/xp')
  xpResponse.mockResolvedValueOnce(Response.json({}, { status: 503 }))
    .mockResolvedValueOnce(Response.json([]))
  await act(async () => root.render(<MovieVersePage />))
  const dialog = await openLeaderboard()
  expect(dialog.querySelector('[role="alert"]')).toBeTruthy()
  expect(dialog.querySelector('table')).toBeNull()
  const retry = [...dialog.querySelectorAll('button')].find((button) => button.textContent === 'Try again')
  await act(async () => retry.click())
  expect(xpResponse).toHaveBeenCalledTimes(2)
  expect(dialog.textContent).toContain('No XP scores yet.')
  expect(dialog.textContent).not.toContain('Demo scores')
  expect(dialog.querySelector('[role="alert"]')).toBeNull()
  act(() => dialog.querySelector('button[aria-label="Close"]').click())
  expect(container.querySelector('dialog')).toBeNull()
})

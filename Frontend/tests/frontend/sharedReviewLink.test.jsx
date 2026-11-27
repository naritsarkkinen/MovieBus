// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import MovieVersePage from '../../src/pages/MovieVersePage'

it('opens the linked club, loads its chosen movie after joining, and copies the same link', async () => {
  const movies = [{ id: 9, title: 'Arrival' }]
  const paths = {
    '/api/movies': movies,
    '/api/communities': [],
    '/api/movies/9/reviews': [{ id: 3, display_name: 'Leena', body: 'A memorable score.' }],
  }
  const fetch = vi.fn(async (path) => {
    if (!(path in paths)) throw new Error('Unexpected request ' + path)
    return Response.json(paths[path])
  })
  vi.stubGlobal('fetch', fetch)
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  const previousUrl = window.location.href
  window.history.replaceState(null, '', '?clubMovie=9')
  const container = document.createElement('div')
  const root = createRoot(container)
  try {
    await act(async () => root.render(<MovieVersePage />))
    expect(container.querySelector('.friends-panel')).toBeTruthy()
    expect(container.querySelector('#shared-review-movie')).toBeNull()
    await act(async () => container.querySelector('.room-card button').click())
    expect(container.querySelector('#shared-review-movie').value).toBe('9')
    const section = container.querySelector('[aria-label="Review together"]')
    expect(section.textContent).toContain('A memorable score.')
    const copy = [...section.querySelectorAll('button')].find((b) => b.textContent === 'Copy review link')
    await act(async () => copy.click())
    expect(writeText).toHaveBeenCalledWith(window.location.href)
    act(() => container.querySelector('.room-card button').click())
    expect(container.querySelector('#shared-review-movie')).toBeNull()
  } finally {
    act(() => root.unmount())
    window.history.replaceState(null, '', previousUrl)
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
})

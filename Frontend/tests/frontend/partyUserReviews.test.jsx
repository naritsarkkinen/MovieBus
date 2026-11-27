// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import usePartyUserReviews from '../../src/hooks/usePartyUserReviews'

const session = { profile: { id: 12 }, token: 'demo-token' }
const row = { id: 8, movie_id: 3, title: 'Arrival', body: 'Worth a rewatch', created_at: '2026-11-14' }
let root
let container
let fetchMock

function PartyFeed(props) {
  const { reviews, status, retry } = usePartyUserReviews(props)
  return (
    <>
      <output>{JSON.stringify({ reviews, status })}</output>
      <button onClick={retry}>Retry</button>
    </>
  )
}

async function renderFeed(overrides = {}) {
  await act(async () => {
    root.render(<PartyFeed active session={session} revision={0} {...overrides} />)
  })
}

function output() {
  return JSON.parse(container.querySelector('output').textContent)
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  container = document.createElement('div')
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  vi.unstubAllGlobals()
})

it('reads submitted reviews only for an active signed-in member and refreshes after a post', async () => {
  fetchMock.mockResolvedValueOnce(Response.json([row])).mockResolvedValueOnce(Response.json([]))
  await renderFeed({ active: false })
  await renderFeed({ session: null })
  expect(output()).toEqual({ reviews: [], status: 'idle' })
  expect(fetchMock).not.toHaveBeenCalled()
  await renderFeed()
  expect(fetchMock).toHaveBeenCalledWith('/api/users/12/reviews', expect.objectContaining({
    headers: { Authorization: 'Bearer demo-token' },
  }))
  expect(output()).toEqual({
    reviews: [{ id: 8, title: 'Arrival', text: 'Worth a rewatch', date: '2026-11-14' }],
    status: 'ready',
  })
  await renderFeed({ revision: 1 })
  expect(output()).toEqual({ reviews: [], status: 'ready' })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('ignores a late response for the previous account and hides reviews on leaving', async () => {
  let resolvePrevious
  fetchMock.mockImplementationOnce(() => new Promise((resolve) => { resolvePrevious = resolve }))
  fetchMock.mockResolvedValueOnce(Response.json([]))
  await renderFeed()
  expect(output().status).toBe('loading')
  await renderFeed({ session: { profile: { id: 15 }, token: 'new-token' } })
  await act(async () => resolvePrevious(Response.json([row])))
  expect(output()).toEqual({ reviews: [], status: 'ready' })
  await renderFeed({ active: false })
  expect(output()).toEqual({ reviews: [], status: 'idle' })
})

it('distinguishes a failed request from an empty list and can retry', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(Response.json([]))
  await renderFeed()
  expect(output()).toEqual({ reviews: [], status: 'error' })
  await act(async () => container.querySelector('button').click())
  expect(output()).toEqual({ reviews: [], status: 'ready' })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

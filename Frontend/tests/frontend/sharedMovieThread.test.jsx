// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import useSharedMovieThread from '../../src/hooks/useSharedMovieThread'

const review = { id: 7, display_name: 'Robin', body: 'Great score.' }
let root
let container
let fetchMock

function Thread({ movieId, revision }) {
  const { status, reviews, refresh } = useSharedMovieThread(movieId, revision)
  return (
    <>
      <output>{status}</output>
      {reviews.map((row) => <p key={row.id}>{row.text}</p>)}
      <button onClick={refresh}>Refresh</button>
    </>
  )
}

function render(movieId, revision = null) {
  return act(async () => root.render(<Thread movieId={movieId} revision={revision} />))
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

it('reads the selected movie and ignores late results after switching movies', async () => {
  await render(null)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(container.querySelector('output').textContent).toBe('idle')
  let finishFirst
  fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve }))
  fetchMock.mockResolvedValueOnce(Response.json([review]))
  await render(12)
  expect(container.querySelector('output').textContent).toBe('loading')
  await render(24)
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/movies/12/reviews', '/api/movies/24/reviews'])
  await act(async () => finishFirst(Response.json([])))
  expect(container.querySelector('p').textContent).toBe(review.body)
  await render(null)
  expect(container.querySelector('p')).toBeNull()
})

it('retries a failed read and fetches newly posted reviews', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Offline'))
  fetchMock.mockResolvedValueOnce(Response.json([]))
  fetchMock.mockResolvedValueOnce(Response.json([review]))
  await render(12)
  expect(container.querySelector('output').textContent).toBe('error')
  await act(async () => container.querySelector('button').click())
  expect(container.querySelector('output').textContent).toBe('ready')
  await render(12, review.id)
  expect(container.querySelector('p').textContent).toBe(review.body)
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

it('loads other participants’ reviews on returning to an active thread', async () => {
  fetchMock.mockResolvedValueOnce(Response.json([])).mockResolvedValueOnce(Response.json([review]))
  await render(12)
  await act(async () => window.dispatchEvent(new Event('focus')))
  expect(container.querySelector('p').textContent).toBe(review.body)
  await render(null)
  await act(async () => window.dispatchEvent(new Event('focus')))
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, vi } from 'vitest'
import MovieVersePage from '../../../src/pages/MovieVersePage'

export const accounts = [
  { id: 1, display_name: 'Leena', email: 'leena@example.test' },
  { id: 2, display_name: 'Robin', email: 'robin@example.test' },
]

function reviewApi() {
  const reviews = []
  return async (path, request) => {
    const user = accounts.find((a) => request.headers.Authorization === 'Bearer test-' + a.id)
    if (path === '/api/movies') return Response.json([{ id: 9, title: 'Arrival' }])
    if (path === '/api/communities') return Response.json([])
    if (path === '/api/auth/login' && request.method === 'POST') {
      const credentials = JSON.parse(request.body)
      const account = accounts.find((a) => a.email === credentials.email)
      if (account) return Response.json({ user: account, token: 'test-' + account.id })
    }
    if (user && path === '/api/users/' + user.id + '/reviews') {
      return Response.json(reviews.filter((review) => review.user_id === user.id))
    }
    if (path === '/api/movies/9/reviews') {
      if (request.method === 'GET') return Response.json(reviews)
      if (request.method === 'POST' && user) {
        const row = {
          id: reviews.length + 1, user_id: user.id, display_name: user.display_name,
          movie_id: 9, title: 'Arrival', body: JSON.parse(request.body).body,
        }
        reviews.unshift(row)
        return Response.json(row, { status: 201 })
      }
    }
    return Response.json({ error: 'Unexpected request' }, { status: 400 })
  }
}

export function button(container, text) {
  return [...container.querySelectorAll('button')].find((item) => item.textContent.trim() === text)
}

export async function signIn(container, account) {
  await act(async () => container.querySelector('.user-chip').click())
  const modal = container.querySelector('[aria-label="Avatar studio"]')
  modal.querySelector('[name="email"]').value = account.email
  modal.querySelector('[name="password"]').value = 'test-password'
  await act(async () => button(modal, 'Sign in').click())
  expect(modal.querySelector('#mv-display-name').value).toBe(account.display_name)
  await act(async () => modal.querySelector('[aria-label="Close"]').click())
}

export async function joinAndSignIn(container, account) {
  await signIn(container, account)
  await act(async () => button(container, 'Join').click())
}

export async function openPartyClients() {
  vi.stubGlobal('fetch', reviewApi())
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const previousUrl = window.location.href
  window.history.replaceState(null, '', '?clubMovie=9')
  const [first, second] = accounts.map(() => document.createElement('div'))
  document.body.append(first, second)
  const roots = [createRoot(first), createRoot(second)]
  function close() {
    act(() => roots.forEach((root) => root.unmount()))
    first.remove()
    second.remove()
    window.history.replaceState(null, '', previousUrl)
    vi.unstubAllGlobals()
  }

  try {
    await act(async () => roots.forEach((root) => root.render(<MovieVersePage />)))
    return { first, second, close }
  } catch (error) {
    close()
    throw error
  }
}

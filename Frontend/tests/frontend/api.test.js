import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../src/api/client.js'
import { authenticate, saveAvatar } from '../../src/api/users.js'
import { fetchReviews, postRating, postReview } from '../../src/api/reviews.js'

const api = { baseUrl: 'http://localhost:4000/api' }

function response(body, status = 200) {
  return Response.json(body, { status })
}

function sent(fetchMock, index = 0) {
  const [url, init] = fetchMock.mock.calls[index]
  return [url, init.method, init.body && JSON.parse(init.body)]
}

afterEach(() => vi.unstubAllGlobals())

describe('API client', () => {
  it('uses the Vite proxy by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)
    await apiRequest('/health')
    expect(sent(fetchMock)).toEqual(['/api/health', 'GET', undefined])
  })

  it('reports server errors and skips requests with no API address', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ error: 'Rejected' }, 400))
    vi.stubGlobal('fetch', fetchMock)
    await expect(apiRequest('/x', api)).rejects.toThrow('Rejected')
    await expect(apiRequest('/x', { baseUrl: '' })).rejects.toThrow('No API address')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('account profile', () => {
  it.each(['login', 'signup'])('uses the %s account for an authenticated profile save', async (mode) => {
    const credentials = { email: 'mila@example.test', password: 'example-password' }
    if (mode === 'signup') credentials.display_name = 'Explorer'
    const row = { id: 9, display_name: 'Explorer', avatar_emoji: 'A', skin: 'blue' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ user: row, token: 'account-token' }))
      .mockResolvedValueOnce(response({ ...row, display_name: 'Mila', skin: 'mint' }))
    vi.stubGlobal('fetch', fetchMock)
    const session = await authenticate(mode, credentials, api)
    const saved = await saveAvatar(session, { name: ' Mila ', avatar: 'A', skin: 'mint' }, api)
    expect(sent(fetchMock)).toEqual([api.baseUrl + '/auth/' + mode, 'POST', credentials])
    expect(sent(fetchMock, 1)).toEqual([
      api.baseUrl + '/users/9/avatar', 'PATCH',
      { display_name: 'Mila', avatar_emoji: 'A', skin: 'mint' },
    ])
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer account-token')
    expect(saved).toEqual({ id: 9, name: 'Mila', avatar: 'A', skin: 'mint' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reports an expired session without retrying as a guest', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ error: 'Expired' }, 401))
    vi.stubGlobal('fetch', fetchMock)
    const session = { profile: { id: 9 }, token: 'expired' }
    await expect(saveAvatar(session, { name: 'Mila' }, api)).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('movie feedback', () => {
  it('reads database reviews and sends the existing rating and review payloads', async () => {
    const review = { id: 7, display_name: 'Mila', body: 'Great film', created_at: '2026-11-15' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([review]))
      .mockResolvedValueOnce(response({ score: 4 }, 201))
      .mockResolvedValueOnce(response(review, 201))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchReviews(42, api)).toEqual([
      { id: 7, author: 'Mila', text: 'Great film', date: '2026-11-15' },
    ])
    await expect(postRating(42, 9, 4, api)).resolves.toMatchObject({ score: 4 })
    await expect(postReview(42, 9, 'Great film', api)).resolves.toEqual(review)

    const movie = api.baseUrl + '/movies/42'
    expect(sent(fetchMock)).toEqual([movie + '/reviews', 'GET', undefined])
    expect(sent(fetchMock, 1)).toEqual([movie + '/ratings', 'POST', { user_id: 9, score: 4 }])
    expect(sent(fetchMock, 2)).toEqual([movie + '/reviews', 'POST', { user_id: 9, body: 'Great film' }])
  })

  it('surfaces a rejected review write to the caller', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ error: 'Could not save review' }, 400)))
    await expect(postReview(42, 9, 'Great film', api)).rejects.toThrow('Could not save review')
  })
})

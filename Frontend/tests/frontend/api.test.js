import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../src/api/client.js'
import { ensureUser, savedUser, saveAvatar } from '../../src/api/users.js'
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

describe('guests', () => {
  it('creates one guest for concurrent writes and stores the saved profile', async () => {
    const baseUrl = 'http://localhost:4001/api'
    const options = { baseUrl }
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ id: 9, display_name: 'Explorer' }, 201))
      .mockResolvedValueOnce(response({
        id: 9, display_name: 'Mila', avatar_emoji: '🦊', skin: 'mint',
      }))
    vi.stubGlobal('fetch', fetchMock)

    const [first, second] = await Promise.all([
      ensureUser('Explorer', options), ensureUser('Explorer', options),
    ])
    expect(first).toBe(second)
    expect(sent(fetchMock)).toEqual([baseUrl + '/users', 'POST', { display_name: 'Explorer' }])

    const profile = await saveAvatar(9, { name: ' Mila ', avatar: '🦊', skin: 'mint' }, options)
    expect(sent(fetchMock, 1)).toEqual([
      baseUrl + '/users/9/avatar', 'PATCH',
      { display_name: 'Mila', avatar_emoji: '🦊', skin: 'mint' },
    ])
    expect(profile).toEqual({ id: 9, name: 'Mila', avatar: '🦊', skin: 'mint' })
    expect(JSON.parse(store.get('mv-guest:' + baseUrl))).toEqual(profile)
    expect(savedUser(baseUrl)).toEqual(profile)
    expect(savedUser(api.baseUrl)).toBeNull()
    expect(await ensureUser('Mila', options)).toEqual(profile)
    expect(fetchMock).toHaveBeenCalledTimes(2)
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

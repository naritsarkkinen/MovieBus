import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, listFrom } from '../../src/api/client.js'
import { ensureUser, saveAvatar, toUser } from '../../src/api/users.js'
import {
  fetchReviews,
  postRating,
  postReview,
  toReview,
} from '../../src/api/reviews.js'
import {
  fetchCommunities,
  joinCommunity,
  toCommunity,
} from '../../src/api/communities.js'

const API = 'http://localhost:4000/api'

// fake fetch that answers with the given JSON
function answer(json, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => json,
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

// what was sent in the n-th fetch call
function sent(fn, n = 0) {
  const [url, init] = fn.mock.calls[n]
  return { url, method: init.method, body: init.body && JSON.parse(init.body) }
}

afterEach(() => vi.unstubAllGlobals())

describe('apiRequest', () => {
  it('sends JSON and returns the answer', async () => {
    const fetchMock = answer({ ok: 1 })
    const result = await apiRequest('/x', {
      method: 'POST',
      body: { a: 1 },
      baseUrl: API + '/',
    })
    expect(result).toEqual({ ok: 1 })
    expect(sent(fetchMock)).toEqual({
      url: API + '/x',
      method: 'POST',
      body: { a: 1 },
    })
  })

  it('throws on server errors and without an API address', async () => {
    answer({ error: 'x' }, 500)
    await expect(apiRequest('/x', { baseUrl: API })).rejects.toThrow('500')
    await expect(apiRequest('/x', { baseUrl: '' })).rejects.toThrow(
      'No API address',
    )
  })

  it('reads plain and wrapped lists', () => {
    expect(listFrom([1], 'reviews')).toEqual([1])
    expect(listFrom({ reviews: [1, 2] }, 'reviews')).toEqual([1, 2])
    expect(listFrom({ results: [3] }, 'reviews')).toEqual([3])
    expect(listFrom(null, 'reviews')).toEqual([])
  })
})

describe('users', () => {
  it('maps a user from the backend', () => {
    expect(toUser({ id: 5, display_name: 'Mila' })).toEqual({
      id: 5,
      name: 'Mila',
    })
  })

  it('creates a guest user with POST /users', async () => {
    const fetchMock = answer({ id: 9, display_name: 'Explorer' })
    const user = await ensureUser('Explorer', { baseUrl: API })
    expect(user).toEqual({ id: 9, name: 'Explorer' })
    expect(sent(fetchMock)).toEqual({
      url: API + '/users',
      method: 'POST',
      body: { display_name: 'Explorer' },
    })
  })

  it('saves the avatar with PATCH /users/:id/avatar', async () => {
    const fetchMock = answer({})
    await saveAvatar(
      9,
      { name: 'E', avatar: '🦊', skin: 'mint' },
      { baseUrl: API },
    )
    expect(sent(fetchMock)).toEqual({
      url: API + '/users/9/avatar',
      method: 'PATCH',
      body: { display_name: 'E', avatar_emoji: '🦊', skin: 'mint' },
    })
  })
})

describe('reviews', () => {
  it('maps a review from the backend', () => {
    expect(
      toReview({
        id: 1,
        user_id: 2,
        movie_id: 3,
        body: 'Great',
        created_at: '2026-11-15',
        display_name: 'Alex',
      }),
    ).toEqual({
      id: 1,
      author: 'Alex',
      text: 'Great',
      date: '2026-11-15',
    })
  })

  it('loads reviews for a movie', async () => {
    const fetchMock = answer([{ id: 1, body: 'Wow' }])
    const list = await fetchReviews(3, { baseUrl: API })
    expect(list[0]).toMatchObject({ author: 'Explorer', text: 'Wow' })
    expect(sent(fetchMock).url).toBe(API + '/movies/3/reviews')
  })

  it('posts a rating and a review in the format the backend expects', async () => {
    const fetchMock = answer({})
    await postRating(3, 9, 4, { baseUrl: API })
    await postReview(3, 9, 'Nice', { baseUrl: API })
    expect(sent(fetchMock, 0)).toEqual({
      url: API + '/movies/3/ratings',
      method: 'POST',
      body: { user_id: 9, score: 4 },
    })
    expect(sent(fetchMock, 1)).toEqual({
      url: API + '/movies/3/reviews',
      method: 'POST',
      body: { user_id: 9, body: 'Nice' },
    })
  })
})

describe('communities', () => {
  it('maps a community from the backend', () => {
    expect(
      toCommunity({
        id: 3,
        name: 'Horror Night',
        description: null,
        member_count: 2,
      }),
    ).toEqual({
      id: 3,
      name: 'Horror Night',
      description: '',
      members: 2,
    })
  })

  it('loads and joins communities', async () => {
    const fetchMock = answer([
      { id: 1, name: 'Friday Film Club', member_count: 4 },
    ])
    const list = await fetchCommunities({ baseUrl: API })
    expect(list[0].members).toBe(4)
    await joinCommunity(1, 9, { baseUrl: API })
    expect(sent(fetchMock, 1)).toEqual({
      url: API + '/communities/1/join',
      method: 'POST',
      body: { user_id: 9 },
    })
  })
})

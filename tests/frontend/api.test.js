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
  it('maps database users', () => {
    expect(toUser({ user_id: 5, nickname: 'Mila' })).toEqual({
      id: 5,
      name: 'Mila',
    })
  })

  it('creates a guest user with POST /users', async () => {
    const fetchMock = answer({ user_id: 9, nickname: 'Explorer' })
    const user = await ensureUser('Explorer', { baseUrl: API })
    expect(user).toEqual({ id: 9, name: 'Explorer' })
    expect(sent(fetchMock)).toEqual({
      url: API + '/users',
      method: 'POST',
      body: { nickname: 'Explorer' },
    })
  })

  it('saves the avatar with PATCH /users/:id/avatar', async () => {
    const fetchMock = answer({})
    await saveAvatar(
      9,
      { nickname: 'E', avatar: '🦊', skin: 'mint' },
      {
        baseUrl: API,
      },
    )
    expect(sent(fetchMock)).toEqual({
      url: API + '/users/9/avatar',
      method: 'PATCH',
      body: { nickname: 'E', avatar: '🦊', skin: 'mint' },
    })
  })
})

describe('reviews', () => {
  it('maps rows from the reviews table', () => {
    expect(
      toReview({
        review_id: 1,
        nickname: 'Alex',
        stars: 4,
        comment: 'Great',
        created_at: '2026-11-15',
      }),
    ).toEqual({
      id: 1,
      author: 'Alex',
      stars: 4,
      text: 'Great',
      date: '2026-11-15',
    })
  })

  it('loads reviews for a movie', async () => {
    const fetchMock = answer([{ review_id: 1, stars: 5, comment: 'Wow' }])
    const list = await fetchReviews(157336, { baseUrl: API })
    expect(list[0]).toMatchObject({ author: 'Explorer', stars: 5, text: 'Wow' })
    expect(sent(fetchMock).url).toBe(API + '/movies/157336/reviews')
  })

  it('posts a rating and a review in the agreed format', async () => {
    const fetchMock = answer({})
    await postRating(157336, 9, 4, { baseUrl: API })
    await postReview(
      157336,
      9,
      { stars: 4, comment: 'Nice' },
      {
        baseUrl: API,
      },
    )
    expect(sent(fetchMock, 0)).toEqual({
      url: API + '/movies/157336/ratings',
      method: 'POST',
      body: { user_id: 9, stars: 4 },
    })
    expect(sent(fetchMock, 1)).toEqual({
      url: API + '/movies/157336/reviews',
      method: 'POST',
      body: { user_id: 9, stars: 4, comment: 'Nice' },
    })
  })
})

describe('communities', () => {
  it('maps clubs from the database', () => {
    expect(
      toCommunity({ club_id: 3, name: 'Horror Night', is_public: false }),
    ).toEqual({
      id: 3,
      name: 'Horror Night',
      description: 'Private club',
      members: 0,
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

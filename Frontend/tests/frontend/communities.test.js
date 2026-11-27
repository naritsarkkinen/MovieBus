import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCommunities, toCommunity } from '../../src/api/communities.js'

const baseUrl = 'http://localhost:4000/api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('communities', () => {
  it('maps database communities', () => {
    expect(
      toCommunity({
        id: 2,
        name: 'Sci-Fi Explorers',
        description: null,
        member_count: '5',
      }),
    ).toEqual({
      id: 2,
      name: 'Sci-Fi Explorers',
      description: '',
      members: 5,
    })
  })

  it('loads the list from the API', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json([
          {
            id: 1,
            name: 'Friday Film Club',
            description: 'Weekly picks',
            member_count: 0,
          },
        ]),
      )
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchCommunities({ baseUrl })).resolves.toEqual([
      {
        id: 1,
        name: 'Friday Film Club',
        description: 'Weekly picks',
        members: 0,
      },
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      baseUrl + '/communities',
      expect.any(Object),
    )
  })

  it('throws when the API answers with something that is not a list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ oops: true })),
    )
    await expect(fetchCommunities({ baseUrl })).rejects.toThrow(
      'Invalid community list',
    )
  })
})

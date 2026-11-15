import { afterEach, describe, expect, it, vi } from 'vitest'
import { listFrom } from '../../src/api/client.js'
import { formatRating, loadMovies, toMovie } from '../../src/api/movies.js'
import { initialMovies } from '../../src/data/MockMovies.js'

const API = 'http://localhost:4000/api'

// One movie as TMDB returns it in a list (e.g. /trending/movie/week)
const tmdbRow = {
  id: 157336,
  title: 'Interstellar',
  release_date: '2014-11-05',
  genre_ids: [878, 12],
  overview: 'The adventures of a group of explorers.',
  poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  vote_average: 8.456,
  vote_count: 37000,
}

describe('toMovie', () => {
  it('turns a TMDB movie into our movie shape', () => {
    expect(toMovie(tmdbRow)).toEqual({
      id: 157336,
      title: 'Interstellar',
      year: 2014,
      genre: 'Sci-Fi',
      desc: 'The adventures of a group of explorers.',
      emoji: '🎬',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      rating: 8.5,
      votes: '37000',
      color: 'violet',
      tag: 'TOP RATED',
    })
  })

  it('handles a new movie without votes, poster or genre', () => {
    const movie = toMovie({
      id: 1,
      title: 'Brand New',
      genre_ids: [],
      poster_path: null,
      vote_average: 0,
      vote_count: 0,
    })
    expect(movie.rating).toBeNull()
    expect(movie.tag).toBe('NEW')
    expect(movie.poster).toBeNull()
    expect(movie.genre).toBe('Other')
    expect(formatRating(movie.rating)).toBe('New')
  })
})

describe('listFrom', () => {
  it('accepts a plain list, TMDB { results } and { movies }', () => {
    expect(listFrom([tmdbRow], 'movies')).toHaveLength(1)
    expect(listFrom({ results: [tmdbRow], page: 1 }, 'movies')).toHaveLength(1)
    expect(listFrom({ movies: [tmdbRow] }, 'movies')).toHaveLength(1)
    expect(listFrom({ error: 'x' }, 'movies')).toEqual([])
  })
})

describe('loadMovies', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns live movies when the API answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ results: [tmdbRow] }),
      }),
    )
    const result = await loadMovies(API + '/')
    expect(fetch).toHaveBeenCalledWith(API + '/movies', expect.any(Object))
    expect(result.source).toBe('live')
    expect(result.movies[0].title).toBe('Interstellar')
  })

  it('falls back to sample movies when the API is down', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const result = await loadMovies(API)
    expect(result.source).toBe('sample')
    expect(result.movies).toBe(initialMovies)
  })

  it('falls back when the API returns an error or no movies', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    )
    expect((await loadMovies(API)).source).toBe('sample')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: async () => [] }),
    )
    expect((await loadMovies(API)).source).toBe('sample')
  })

  it('uses sample movies when no API address is configured', async () => {
    vi.stubGlobal('fetch', vi.fn())
    const result = await loadMovies('')
    expect(result.source).toBe('sample')
    expect(fetch).not.toHaveBeenCalled()
  })
})

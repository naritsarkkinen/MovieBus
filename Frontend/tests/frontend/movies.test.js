import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMovie, formatRating, loadMovies, toMovie } from '../../src/api/movies.js'
import { initialMovies } from '../../src/data/MockMovies.js'

const baseUrl = 'http://localhost:4000/api'

const movieRow = {
  id: 42,
  title: 'Interstellar',
  release_year: 2014,
  genre: 'Sci-Fi',
  description: 'The adventures of a group of explorers.',
  poster_emoji: '🚀',
  average_rating: '4.2',
  rating_count: 3,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('movies', () => {
  it('maps database movies and converts the five-point average', () => {
    expect(toMovie(movieRow)).toEqual({
      id: 42,
      title: 'Interstellar',
      year: 2014,
      genre: 'Sci-Fi',
      desc: movieRow.description,
      emoji: '🚀',
      poster: null,
      rating: 8.4,
      votes: '3',
      color: 'violet',
      tag: 'TOP RATED',
    })
    const unrated = toMovie({ ...movieRow, average_rating: null, rating_count: 0 })
    expect(formatRating(unrated.rating)).toBe('New')
  })

  it('reads the catalogue and the latest rating from the detail route', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json([movieRow]))
      .mockResolvedValueOnce(Response.json({ ...movieRow, average_rating: '4.5', rating_count: 4 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(loadMovies(baseUrl + '/')).resolves.toEqual({ source: 'live', movies: [toMovie(movieRow)] })
    expect(fetchMock).toHaveBeenCalledWith(baseUrl + '/movies', expect.any(Object))
    await expect(fetchMovie(42, { baseUrl })).resolves.toMatchObject({ rating: 9, votes: '4' })
    expect(fetchMock).toHaveBeenCalledWith(baseUrl + '/movies/42', expect.any(Object))
  })

  it('keeps a successful empty catalogue live', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([])))
    await expect(loadMovies(baseUrl)).resolves.toEqual({ movies: [], source: 'live' })
  })

  it('falls back to sample movies when the API fails or is disabled', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: 'Offline' }, { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    const sample = { movies: initialMovies, source: 'sample' }
    await expect(loadMovies(baseUrl)).resolves.toEqual(sample)
    await expect(loadMovies('')).resolves.toEqual(sample)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

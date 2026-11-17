import { initialMovies } from '../data/MockMovies'
import { API_URL, apiRequest } from './client'

const genreColors = {
  'Sci-Fi': 'violet',
  Action: 'blue',
  Animation: 'pink',
  Horror: 'green',
  Comedy: 'rose',
  Romance: 'gold',
  Adventure: 'orange',
  Drama: 'steel',
}

export function toMovie(row) {
  const genre = row.genre || 'Other'
  const count = Number(row.rating_count ?? 0)
  const rating = count > 0 && (row.average_rating ?? null) !== null
    ? Math.round(Number(row.average_rating) * 20) / 10
    : null

  return {
    id: row.id,
    title: row.title,
    year: row.release_year ?? '',
    genre,
    desc: row.description || 'No description yet.',
    emoji: row.poster_emoji || '🎬',
    poster: null,
    rating,
    votes: String(count),
    color: genreColors[genre] || 'violet',
    tag: rating === null ? 'NEW' : rating >= 7.5 ? 'TOP RATED' : genre.toUpperCase(),
  }
}

export function formatRating(rating) {
  return rating ?? 'New'
}

export async function loadMovies(baseUrl = API_URL) {
  if (!baseUrl) return { movies: initialMovies, source: 'sample' }
  try {
    const rows = await apiRequest('/movies', { baseUrl })
    if (!Array.isArray(rows)) throw new Error('Invalid movie catalogue')
    return { movies: rows.map(toMovie), source: 'live' }
  } catch (error) {
    console.warn('Using sample movies:', error.message)
    return { movies: initialMovies, source: 'sample' }
  }
}

export async function fetchMovie(movieId, options) {
  const row = await apiRequest(`/movies/${movieId}`, options)
  return toMovie(row)
}

import { initialMovies } from '../data/MockMovies'
import { API_URL, apiRequest, listFrom } from './client'

// The backend passes movies on from TMDB (The Movie Database).
// TMDB gives only the end of the poster link, e.g. "/abc.jpg".
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500'

// TMDB genre ids -> genre names used in our filters
const genreNames = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
}

// Card colour when a movie has no poster (same names as .poster-* in CSS)
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

function tagFor(rating, genre) {
  if (rating === null) return 'NEW'
  if (rating >= 7.5) return 'TOP RATED'
  return genre.toUpperCase()
}

// Turns one movie from the API into the shape our components use.
// The backend can send two kinds of movie:
//   our own movies table: id, title, release_year, genre, description,
//                         poster_emoji, average_rating (1-5), rating_count
//   a TMDB movie:         id, title, release_date, genre_ids, overview,
//                         poster_path, vote_average (0-10), vote_count
export function toMovie(row) {
  const genre = row.genre || genreNames[row.genre_ids?.[0]] || 'Other'
  const votes = Number(row.rating_count ?? row.vote_count ?? 0)
  const average = Number(row.average_rating ?? row.vote_average)
  const rating = votes > 0 ? Math.round(average * 10) / 10 : null

  let year = row.release_year || ''
  if (row.release_date) year = Number(row.release_date.slice(0, 4))

  return {
    id: row.id,
    title: row.title,
    year,
    genre,
    desc: row.description || row.overview || 'No description yet.',
    emoji: row.poster_emoji || '🎬',
    poster: row.poster_path ? TMDB_IMAGE_URL + row.poster_path : null,
    rating,
    votes: String(votes),
    color: genreColors[genre] || 'violet',
    tag: tagFor(rating, genre),
  }
}

// "New" for movies nobody has rated yet
export function formatRating(rating) {
  return rating === null || rating === undefined ? 'New' : rating
}

// Loads movies from the API. If there is no API address, the API is down or
// it returns nothing, we use the sample movies so the demo always works.
export async function loadMovies(baseUrl = API_URL) {
  if (!baseUrl) return { movies: initialMovies, source: 'sample' }
  try {
    const body = await apiRequest('/movies', { baseUrl })
    const rows = listFrom(body, 'movies')
    if (rows.length === 0) throw new Error('API returned no movies')
    return { movies: rows.map(toMovie), source: 'live' }
  } catch (error) {
    console.warn('Using sample movies:', error.message)
    return { movies: initialMovies, source: 'sample' }
  }
}

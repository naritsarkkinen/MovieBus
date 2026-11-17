import { apiRequest, listFrom } from './client'

// Backend answer (reviews + users tables):
// { id, user_id, movie_id, body, created_at, display_name }
export function toReview(row) {
  return {
    id: row.id,
    author: row.display_name || 'Explorer',
    text: row.body || '',
    date: row.created_at || null,
  }
}

// GET /api/movies/:id/reviews
export async function fetchReviews(movieId, options) {
  const body = await apiRequest(`/movies/${movieId}/reviews`, options)
  return listFrom(body, 'reviews').map(toReview)
}

// POST /api/movies/:id/ratings   { user_id, score }   (score 1-5)
// The backend updates the old rating if the user rates the same movie again.
export function postRating(movieId, userId, score, options) {
  return apiRequest(`/movies/${movieId}/ratings`, {
    method: 'POST',
    body: { user_id: userId, score },
    ...options,
  })
}

// POST /api/movies/:id/reviews   { user_id, body }
export function postReview(movieId, userId, text, options) {
  return apiRequest(`/movies/${movieId}/reviews`, {
    method: 'POST',
    body: { user_id: userId, body: text },
    ...options,
  })
}

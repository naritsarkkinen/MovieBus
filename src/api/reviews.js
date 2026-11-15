import { apiRequest, listFrom } from './client'

// Azure "reviews" table: review_id, user_id, tmdb_movie_id, stars, comment, created_at
export function toReview(row) {
  return {
    id: row.id ?? row.review_id,
    author: row.nickname ?? row.display_name ?? row.user_name ?? 'Explorer',
    stars: Number(row.stars ?? row.score ?? 0) || null,
    text: row.comment ?? row.body ?? '',
    date: row.created_at ?? null,
  }
}

// GET /api/movies/:id/reviews
export async function fetchReviews(movieId, options) {
  const body = await apiRequest(`/movies/${movieId}/reviews`, options)
  return listFrom(body, 'reviews').map(toReview)
}

// POST /api/movies/:id/ratings   { user_id, stars }
// The backend should update the existing rating instead of adding a second one.
export function postRating(movieId, userId, stars, options) {
  return apiRequest(`/movies/${movieId}/ratings`, {
    method: 'POST',
    body: { user_id: userId, stars },
    ...options,
  })
}

// POST /api/movies/:id/reviews   { user_id, stars, comment }
export function postReview(movieId, userId, { stars, comment }, options) {
  return apiRequest(`/movies/${movieId}/reviews`, {
    method: 'POST',
    body: { user_id: userId, stars: stars ?? null, comment },
    ...options,
  })
}

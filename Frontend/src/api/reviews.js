import { apiRequest } from './client'

export function toReview(row) {
  return {
    id: row.id,
    author: row.display_name ?? 'Explorer',
    text: row.body,
    date: row.created_at ?? null,
  }
}

export async function fetchReviews(movieId, options) {
  const rows = await apiRequest(`/movies/${movieId}/reviews`, options)
  if (!Array.isArray(rows)) throw new Error('Invalid review list')
  return rows.map(toReview)
}

export async function fetchUserReviews(userId, options) {
  const rows = await apiRequest(`/users/${userId}/reviews`, options)
  if (!Array.isArray(rows)) throw new Error('Invalid review list')
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    text: row.body,
    date: row.created_at,
  }))
}

export function postRating(movieId, userId, score, options) {
  return apiRequest(`/movies/${movieId}/ratings`, {
    ...options,
    method: 'POST',
    body: { user_id: userId, score },
  })
}

export function postReview(movieId, userId, body, options) {
  return apiRequest(`/movies/${movieId}/reviews`, {
    ...options,
    method: 'POST',
    body: { user_id: userId, body },
  })
}

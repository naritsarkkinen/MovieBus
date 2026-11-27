import { useEffect, useMemo, useState } from 'react'
import { fetchReviews } from '../api/reviews'

export default function useSharedMovieThread(movieId, lastPostedReviewId) {
  const [refreshCount, setRefreshCount] = useState(0)
  const [result, setResult] = useState(null)
  const request = useMemo(
    () => movieId ? { movieId, lastPostedReviewId, refreshCount } : null,
    [movieId, lastPostedReviewId, refreshCount],
  )

  useEffect(() => {
    if (!request) return
    let current = true
    fetchReviews(request.movieId).then(
      (reviews) => {
        if (current) setResult({ request, reviews, status: 'ready' })
      },
      () => {
        if (current) setResult({ request, reviews: [], status: 'error' })
      },
    )
    return () => { current = false }
  }, [request])

  function refresh() {
    setRefreshCount((count) => count + 1)
  }

  useEffect(() => {
    if (!movieId) return
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [movieId])

  if (!request) return { reviews: [], status: 'idle', refresh }
  if (result?.request !== request) return { reviews: [], status: 'loading', refresh }
  return { reviews: result.reviews, status: result.status, refresh }
}

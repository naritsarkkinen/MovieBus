import { useEffect, useMemo, useState } from 'react'
import { fetchUserReviews } from '../api/reviews'

export default function usePartyUserReviews({ session, active, revision }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const request = useMemo(
    () => active && session ? { userId: session.profile.id, token: session.token, revision, attempt } : null,
    [active, session, revision, attempt],
  )

  useEffect(() => {
    if (!request) return
    let current = true
    fetchUserReviews(request.userId, { token: request.token }).then(
      (reviews) => {
        if (current) setResult({ request, reviews, status: 'ready' })
      },
      () => {
        if (current) setResult({ request, reviews: [], status: 'error' })
      },
    )
    return () => { current = false }
  }, [request])

  function retry() {
    setAttempt((n) => n + 1)
  }

  if (!request) return { reviews: [], status: 'idle', retry }
  if (result?.request !== request) return { reviews: [], status: 'loading', retry }
  return { reviews: result.reviews, status: result.status, retry }
}

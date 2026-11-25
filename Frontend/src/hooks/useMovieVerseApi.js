import { useEffect, useState } from 'react'
import { fetchReviews, postRating, postReview, toReview } from '../api/reviews'

// reviews of the open movie + sending ratings and reviews.
// Sending needs a logged-in session (token), 401 = token expired → onExpired
export default function useMovieVerseApi({ session, selectedId, notify, onExpired }) {
  const [reviewsByMovie, setReviewsByMovie] = useState({})

  useEffect(() => {
    if (selectedId === null) return
    fetchReviews(selectedId)
      .then((list) =>
        setReviewsByMovie((all) => ({ ...all, [selectedId]: list })),
      )
      .catch((error) => notify('Could not load reviews: ' + error.message))
  }, [selectedId, notify])

  async function save(action, success) {
    try {
      if (!session) throw new Error('Open Avatar Studio to sign in first.')
      const user = session.profile
      const result = await action(user)
      notify(success)
      return result
    } catch (error) {
      if (error.status === 401) onExpired()
      notify('Save failed: ' + error.message)
      return null
    }
  }

  function sendRating(movie, score) {
    return save(
      async (user) => (await postRating(movie.id, user.id, score, { token: session.token })).score,
      'Rating saved',
    )
  }

  function sendReview(movie, body) {
    return save(async (user) => {
      const row = await postReview(movie.id, user.id, body, { token: session.token })
      const review = toReview({ ...row, display_name: user.name })
      setReviewsByMovie((all) => ({
        ...all,
        [movie.id]: [review, ...(all[movie.id] || [])],
      }))
      return review
    }, 'Review posted')
  }

  return {
    reviewsFor: (movieId) => reviewsByMovie[movieId] || [],
    sendRating,
    sendReview,
  }
}

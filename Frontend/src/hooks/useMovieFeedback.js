import { useState } from 'react'

// my ratings + review drafts for the movie modal.
// api = useMovieVerseApi, refreshMovie = useMovieCatalogue
export default function useMovieFeedback({ api, refreshMovie }) {
  const [myRatings, setMyRatings] = useState({})
  const [ratingPending, setRatingPending] = useState(false)
  const [reviewDrafts, setReviewDrafts] = useState({})
  const [reviewPending, setReviewPending] = useState(false)

  async function rate(movie, value) {
    if (ratingPending) return
    setRatingPending(true)
    try {
      const score = await api.sendRating(movie, value)
      if (score === null) return
      setMyRatings((ratings) => ({ ...ratings, [movie.id]: score }))
      await refreshMovie(movie.id)
    } finally {
      setRatingPending(false)
    }
  }

  function setDraft(movieId, value) {
    setReviewDrafts((drafts) => ({ ...drafts, [movieId]: value }))
  }

  async function saveReview(movie) {
    const draft = reviewDrafts[movie.id] || ''
    const body = draft.trim()
    if (!body || reviewPending) return
    setReviewPending(true)
    try {
      const posted = await api.sendReview(movie, body)
      // clear only if the user did not keep typing meanwhile
      if (posted) {
        setReviewDrafts((drafts) =>
          drafts[movie.id] === draft ? { ...drafts, [movie.id]: '' } : drafts,
        )
      }
    } finally {
      setReviewPending(false)
    }
  }

  return {
    myRatingFor: (movieId) => myRatings[movieId],
    draftFor: (movieId) => reviewDrafts[movieId] || '',
    setDraft,
    rate,
    saveReview,
    ratingPending,
    reviewPending,
  }
}

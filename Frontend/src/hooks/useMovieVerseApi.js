import { useEffect, useState } from 'react'
import { ensureUser, saveAvatar } from '../api/users'
import { fetchReviews, postRating, postReview, toReview } from '../api/reviews'

export default function useMovieVerseApi({ name, selectedId, notify }) {
  const [reviewsByMovie, setReviewsByMovie] = useState({})

  useEffect(() => {
    if (selectedId === null) return
    fetchReviews(selectedId)
      .then((list) =>
        setReviewsByMovie((all) => ({ ...all, [selectedId]: list })),
      )
      .catch((error) => notify('Could not load reviews: ' + error.message))
  }, [selectedId, notify])

  async function save(nameForGuest, action, success) {
    try {
      const user = await ensureUser(nameForGuest)
      const result = await action(user)
      notify(success)
      return result
    } catch (error) {
      notify('Save failed: ' + error.message)
      return null
    }
  }

  function sendRating(movie, score) {
    return save(
      name,
      async (user) => (await postRating(movie.id, user.id, score)).score,
      'Rating saved',
    )
  }

  function sendReview(movie, body) {
    return save(name, async (user) => {
      const row = await postReview(movie.id, user.id, body)
      const review = toReview({ ...row, display_name: user.name })
      setReviewsByMovie((all) => ({
        ...all,
        [movie.id]: [review, ...(all[movie.id] || [])],
      }))
      return review
    }, 'Review posted')
  }

  function sendProfile(profile) {
    const updated = { ...profile, name: profile.name.trim() }
    if (updated.name.length < 2) {
      notify('Display name must be at least 2 characters')
      return null
    }
    return save(
      updated.name,
      (user) => saveAvatar(user.id, updated),
      'Your explorer profile was saved',
    )
  }

  return {
    reviewsFor: (movieId) => reviewsByMovie[movieId] || [],
    sendRating,
    sendReview,
    sendProfile,
  }
}

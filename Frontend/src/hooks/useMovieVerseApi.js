import { useEffect, useState } from 'react'
import { hasApi } from '../api/client'
import { ensureUser, saveAvatar } from '../api/users'
import { fetchReviews, postRating, postReview, toReview } from '../api/reviews'

export default function useMovieVerseApi({ name, selectedId, notify }) {
  const [reviewsByMovie, setReviewsByMovie] = useState({})

  useEffect(() => {
    if (selectedId === null) return undefined
    let ignore = false
    fetchReviews(selectedId)
      .then((list) => {
        if (ignore) return
        setReviewsByMovie((all) => {
          const ids = new Set(list.map((review) => review.id))
          const recent = (all[selectedId] || []).filter((review) => !ids.has(review.id))
          return { ...all, [selectedId]: [...recent, ...list] }
        })
      })
      .catch((error) => {
        if (!ignore) notify('Could not load reviews: ' + error.message)
      })
    return () => {
      ignore = true
    }
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

  function sendRating(movie, score, live) {
    if (!live) {
      notify('Rating updated in sample mode')
      return score
    }
    return save(
      name,
      async (user) => (await postRating(movie.id, user.id, score)).score,
      'Rating saved',
    )
  }

  function sendReview(movie, body, live, stars) {
    function addReview(review) {
      setReviewsByMovie((all) => ({
        ...all,
        [movie.id]: [review, ...(all[movie.id] || []).filter((item) => item.id !== review.id)],
      }))
      return review
    }
    if (!live) {
      notify('Review added in sample mode')
      return addReview({ id: crypto.randomUUID(), author: name, text: body, stars })
    }
    return save(name, async (user) => {
      const row = await postReview(movie.id, user.id, body)
      return addReview(toReview({ ...row, display_name: user.name }))
    }, 'Review posted')
  }

  function sendProfile(profile) {
    const updated = { ...profile, name: profile.name.trim() }
    if (updated.name.length < 2) {
      notify('Display name must be at least 2 characters')
      return null
    }
    if (!hasApi()) {
      notify('Profile updated in sample mode')
      return updated
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

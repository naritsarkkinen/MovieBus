import { useEffect, useState } from 'react'
import { hasApi } from '../api/client'
import { ensureUser, savedUser, saveAvatar } from '../api/users'
import { fetchReviews, postRating, postReview } from '../api/reviews'
import { fetchCommunities, joinCommunity } from '../api/communities'
import { communities as demoCommunities } from '../data/MovieVerseData'

// Everything the page saves to or loads from the backend.
// With an API (VITE_API_URL set) it uses the server; without one it keeps
// working on this device only, so the demo never breaks.
export default function useMovieVerseApi({
  name,
  avatar,
  skin,
  selected,
  notify,
}) {
  const online = hasApi()
  const [user, setUser] = useState(savedUser)
  const [communities, setCommunities] = useState(demoCommunities)
  const [reviewsByMovie, setReviewsByMovie] = useState({})

  // communities from the database
  useEffect(() => {
    if (!online) return undefined
    let ignore = false
    fetchCommunities()
      .then((list) => {
        if (!ignore && list.length > 0) setCommunities(list)
      })
      .catch((error) => console.warn('Communities:', error.message))
    return () => {
      ignore = true
    }
  }, [online])

  // reviews of the movie that is open
  const selectedId = selected?.id
  useEffect(() => {
    if (!online || selectedId === undefined) return undefined
    let ignore = false
    fetchReviews(selectedId)
      .then((list) => {
        if (!ignore)
          setReviewsByMovie((all) => ({ ...all, [selectedId]: list }))
      })
      .catch((error) => console.warn('Reviews:', error.message))
    return () => {
      ignore = true
    }
  }, [online, selectedId])

  // Runs one save: creates the guest user first if needed
  async function save(action, savedText, demoText) {
    if (!online) {
      notify(demoText)
      return
    }
    try {
      const current = await ensureUser(name)
      setUser(current)
      await action(current.id)
      notify(savedText)
    } catch (error) {
      console.warn('Save failed:', error.message)
      notify('Could not reach the server, saved only on this device')
    }
  }

  function sendRating(movie, stars) {
    return save(
      (userId) => postRating(movie.id, userId, stars),
      'Rating saved',
      'Your rating has been saved locally',
    )
  }

  function sendReview(movie, text) {
    // show it right away, then save it
    const mine = {
      id: 'local-' + Date.now(),
      author: name,
      text,
      date: new Date().toISOString(),
    }
    setReviewsByMovie((all) => ({
      ...all,
      [movie.id]: [mine, ...(all[movie.id] || [])],
    }))
    return save(
      (userId) => postReview(movie.id, userId, text),
      'Review posted',
      'Review posted to the demo community',
    )
  }

  function sendJoin(community) {
    const text = 'You joined ' + community.name
    return save((userId) => joinCommunity(community.id, userId), text, text)
  }

  function sendProfile() {
    return save(
      (userId) => saveAvatar(userId, { name, avatar, skin }),
      'Your explorer profile was saved',
      'Your explorer profile was updated',
    )
  }

  return {
    online,
    user,
    communities,
    reviewsFor: (movieId) => reviewsByMovie[movieId] || [],
    sendRating,
    sendReview,
    sendJoin,
    sendProfile,
  }
}

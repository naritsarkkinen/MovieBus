import { useState } from 'react'

export default function useWatchlist(notify) {
  const [watchlist, setWatchlist] = useState([])

  function toggleWatchlist(id) {
    const saved = watchlist.includes(id)
    setWatchlist((list) =>
      saved ? list.filter((x) => x !== id) : [...list, id],
    )
    notify(saved ? 'Removed from your watchlist' : 'Saved to your watchlist')
  }

  return {
    isSaved: (id) => watchlist.includes(id),
    toggleWatchlist,
  }
}

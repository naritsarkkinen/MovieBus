import { useMemo, useState } from 'react'
import { movieHasGenre } from '../data/MovieVerseGenres'

// search box + genre buttons → list of movies that match both
export default function useMovieFilters(movies) {
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  // useMemo = recalculate only when movies or filters change
  const filtered = useMemo(
    () =>
      movies.filter((m) => {
        const matches = (m.title + ' ' + m.genre)
          .toLowerCase()
          .includes(search.toLowerCase())
        const genre = activeGenre === 'All' || movieHasGenre(m, activeGenre)
        return matches && genre
      }),
    [movies, search, activeGenre],
  )
  const visibleIds = useMemo(
    () => new Set(filtered.map((m) => m.id)),
    [filtered],
  )

  return { search, setSearch, activeGenre, setActiveGenre, filtered, visibleIds }
}

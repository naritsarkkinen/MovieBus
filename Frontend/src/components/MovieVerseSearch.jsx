import { useState } from 'react'
import { Search } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'

const MAX_RESULTS = 6

// top bar search: type → quick list under the box
// ↑ ↓ pick a movie, Enter opens it (or the catalogue if nothing picked)
// eslint-disable-next-line max-lines-per-function
export default function MovieVerseSearch({
  search,
  onSearch,
  results,
  onPick,
  onSeeAll,
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1) // -1 = nothing picked

  const shown = results.slice(0, MAX_RESULTS)
  const showList = open && search.trim() !== ''

  function close(input) {
    setOpen(false)
    setHighlight(-1)
    input.blur() // back to walking
  }

  function handleKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Enter' && search.trim() !== '') {
      if (shown[highlight]) onPick(shown[highlight])
      else onSeeAll()
      close(e.target)
    } else if (e.key === 'Escape') {
      // list open → Esc only closes the list, not the catalogue behind it
      if (showList) e.stopPropagation()
      close(e.target)
    }
  }

  return (
    <div className="search-wrap">
      <div className="search-box">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => {
            onSearch(e.target.value)
            setOpen(true)
            setHighlight(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKey}
          placeholder="Search movies, genres..."
          aria-label="Search movies"
        />
      </div>

      {showList && (
        // onMouseDown + preventDefault → input does not blur before the click
        <div className="search-results" onMouseDown={(e) => e.preventDefault()}>
          {shown.length === 0 && (
            <p className="search-empty">No movies match “{search}”</p>
          )}
          {shown.map((movie, i) => (
            <button
              key={movie.id}
              className={'search-result' + (i === highlight ? ' active' : '')}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => {
                onPick(movie)
                setOpen(false)
              }}
            >
              <span className={'search-thumb poster-' + movie.color}>
                <MoviePosterImage src={movie.poster} title={movie.title} />
                <span>{movie.emoji}</span>
              </span>
              <span className="search-text">
                <b>{movie.title}</b>
                <small>
                  {movie.year} · {movie.genre}
                </small>
              </span>
            </button>
          ))}
          {results.length > 0 && (
            <button
              className="search-all"
              onClick={() => {
                onSeeAll()
                setOpen(false)
              }}
            >
              See all {results.length} in Catalogue <kbd>Enter</kbd>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

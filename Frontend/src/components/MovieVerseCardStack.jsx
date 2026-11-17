import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { formatRating } from '../api/movies'
import { clampIndex } from '../utils/clampIndex'

// how many cards are visible on each side of the middle card
const SIDE_CARDS = 2

// Movies as overlapping cards, like the phone app switcher.
// The middle card is big, the others are smaller and further to the side.
// active = false while a popup is open on top (then the keys do nothing).
export default function MovieVerseCardStack({
  title,
  movies,
  active,
  onOpen,
  onClose,
}) {
  const [index, setIndex] = useState(0)
  const current = clampIndex(index, movies.length)

  function go(step) {
    setIndex(clampIndex(current + step, movies.length))
  }

  // ← → (or A / D) on the keyboard
  useEffect(() => {
    if (!active) return undefined
    function handleKey(e) {
      const key = e.key.toLowerCase()
      if (key === 'arrowleft' || key === 'a') go(-1)
      if (key === 'arrowright' || key === 'd') go(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  // mouse wheel / touchpad: one card per scroll, at most one every 250 ms
  const lastWheel = useRef(0)
  function handleWheel(e) {
    const amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(amount) < 10 || Date.now() - lastWheel.current < 250) return
    lastWheel.current = Date.now()
    go(amount > 0 ? 1 : -1)
  }

  // swipe / drag: remember where the finger went down, compare when it goes up
  const dragStart = useRef(null)
  const swiped = useRef(false)
  function handlePointerUp(e) {
    if (dragStart.current === null) return
    const moved = e.clientX - dragStart.current
    dragStart.current = null
    swiped.current = Math.abs(moved) > 50
    if (swiped.current) go(moved < 0 ? 1 : -1)
  }
  // after a swipe the browser also sends a "click": ignore that one,
  // otherwise swiping over the middle card would open the movie
  function ignoreClickAfterSwipe(e) {
    if (!swiped.current) return
    swiped.current = false
    e.stopPropagation()
  }

  return (
    <div
      className="card-stack"
      onWheel={handleWheel}
      onPointerDown={(e) => (dragStart.current = e.clientX)}
      onPointerUp={handlePointerUp}
      onClickCapture={ignoreClickAfterSwipe}
    >
      <div className="card-stack-head">
        <h2>{title}</h2>
        <span>
          {movies.length === 0 ? 0 : current + 1} / {movies.length}
        </span>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {movies.length === 0 && (
        <div className="empty-state">
          No movies here. Try another search or genre.
        </div>
      )}

      <div className="card-stack-track">
        {movies.map((movie, i) => {
          const offset = i - current // 0 = middle, -1 = left, 1 = right...
          if (Math.abs(offset) > SIDE_CARDS) return null
          const distance = Math.abs(offset)
          return (
            <button
              key={movie.id}
              className={'stack-card' + (offset === 0 ? ' center' : '')}
              style={{
                transform: `translateX(${offset * 55}%) scale(${1 - distance * 0.12})`,
                zIndex: 10 - distance,
                opacity: 1 - distance * 0.3,
              }}
              onClick={() => (offset === 0 ? onOpen(movie) : setIndex(i))}
            >
              <div className={'stack-poster poster-' + movie.color}>
                <MoviePosterImage src={movie.poster} title={movie.title} />
                <span className="poster-emoji">{movie.emoji}</span>
              </div>
              <b>{movie.title}</b>
              <small>
                {movie.year} · {movie.genre} · ★ {formatRating(movie.rating)}
              </small>
            </button>
          )
        })}
      </div>

      <p className="card-stack-hint">
        ← → · scroll · swipe to browse · click to open
      </p>
    </div>
  )
}

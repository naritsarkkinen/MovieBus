import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { clampIndex } from '../utils/clampIndex'
import { coverFlow } from '../utils/coverFlow'
import { genreRows } from '../data/MovieVerseGenres'
import { nextGenre } from '../utils/catalogueNav'

const SIDE_CARDS = 3
const MOVES = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
}
const OPEN_KEYS = ['e', 'f', 'enter']

function isTyping(target) {
  return target instanceof HTMLElement && target.matches('input, textarea')
}

// genres per line, same as .catalogue-grid in CSS (phone = 1)
function genresPerLine() {
  return window.innerWidth <= 720 ? 1 : 2
}

// CATALOGUE: all movies on top, under it the genres 2 side by side
// 1. WASD / arrows = pick a genre, E / F / Enter = go inside it
// 2. inside: A D / ← → = browse the movies, E / F / Enter = open the middle movie, Esc = back to genres
// active = false → movie popup on top, keys do nothing
// eslint-disable-next-line max-lines-per-function
export default function MovieVerseCatalogue({
  movies,
  emptyText,
  active,
  onOpen,
  onClose,
}) {
  const rows = [{ genre: 'All movies', movies }, ...genreRows(movies)]
  const [rowIndex, setRowIndex] = useState(0)
  const [cardIndex, setCardIndex] = useState({}) // genre → index in that row
  const [inside, setInside] = useState(false) // true = browsing one genre's movies
  const currentRow = clampIndex(rowIndex, rows.length)
  const rowRefs = useRef([])

  // every row remembers its own spot
  function cardOf(row) {
    return clampIndex(cardIndex[row.genre] ?? 0, row.movies.length)
  }
  function pickCard(row, index) {
    setCardIndex((old) => ({ ...old, [row.genre]: index }))
  }

  useEffect(() => {
    if (!active) return undefined
    function handleKey(e) {
      if (isTyping(e.target)) return
      const key = e.key.toLowerCase()
      const move = MOVES[key]
      const row = rows[currentRow]
      const movie = row.movies[cardOf(row)]
      // Enter on a catalogue card = that card's own click, not this
      const onCard = key === 'enter' && e.target.closest?.('.catalogue button')

      if (key === 'escape' && inside) {
        e.stopPropagation() // Esc only leaves the genre, catalogue stays open
        setInside(false)
      } else if (move && !inside) {
        e.preventDefault()
        setRowIndex(nextGenre(currentRow, move, genresPerLine(), rows.length))
      } else if (move === 'left' || move === 'right') {
        e.preventDefault()
        const next = cardOf(row) + (move === 'left' ? -1 : 1)
        pickCard(row, clampIndex(next, row.movies.length))
      } else if (OPEN_KEYS.includes(key) && !onCard) {
        e.preventDefault() // stops Enter from also pressing a top bar button
        if (!inside) setInside(true)
        else if (movie) onOpen(movie)
      }
    }
    // true = runs before the page's Esc handler, so stopPropagation works
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  })

  // new row → scroll it into view (first row → back to the top)
  const pageRef = useRef(null)
  useEffect(() => {
    if (currentRow === 0) {
      pageRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      rowRefs.current[currentRow].scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    }
  }, [currentRow])

  return (
    <div ref={pageRef} className="catalogue">
      <div className="card-stack-head">
        <h2>Catalogue</h2>
        <span>
          {movies.length} movies · {rows.length - 1} genres
        </span>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <p className="card-stack-hint">
        {inside
          ? '← → / A D browse · E / F open movie · Esc back to genres'
          : 'WASD / arrows pick a genre · E / F go inside · or click'}
      </p>

      {movies.length === 0 && <div className="empty-state">{emptyText}</div>}

      {movies.length > 0 && (
        <div className="catalogue-grid">
          {rows.map((row, r) => {
            const current = cardOf(row)
            return (
              <section
                key={row.genre}
                ref={(el) => (rowRefs.current[r] = el)}
                className={
                  'catalogue-row' +
                  (r === 0 ? ' all' : '') + // All movies = full width on top
                  (r === currentRow ? ' active' : '') +
                  (r === currentRow && inside ? ' inside' : '')
                }
                onPointerDown={() => {
                  setRowIndex(r)
                  setInside(true) // clicked a row = you are browsing it
                }}
              >
                <h3>
                  {row.genre} <span>{row.movies.length}</span>
                </h3>
                <div className="card-stack-track catalogue-track">
                  {row.movies.map((movie, i) => {
                    const offset = i - current
                    if (Math.abs(offset) > SIDE_CARDS) return null
                    return (
                      <button
                        key={movie.id}
                        className={
                          'stack-card' + (offset === 0 ? ' center' : '')
                        }
                        style={{
                          transform: coverFlow(offset),
                          zIndex: 10 - Math.abs(offset), // middle on top
                        }}
                        onClick={() =>
                          offset === 0 ? onOpen(movie) : pickCard(row, i)
                        }
                      >
                        <div className={'stack-poster poster-' + movie.color}>
                          <MoviePosterImage
                            src={movie.poster}
                            title={movie.title}
                          />
                          <span className="poster-emoji">{movie.emoji}</span>
                        </div>
                        <b>{movie.title}</b>
                        <small>{movie.year}</small>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

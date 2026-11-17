import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { clampIndex } from '../utils/clampIndex'

// how many cards are visible on each side of the middle card
const SIDE_CARDS = 3

// Where a card is drawn in 3D ("cover flow", like old iTunes):
// offset = how far the card is from the middle card (0 = middle,
// -1 = first on the left, 2 = second on the right...).
// - the middle card faces you
// - side cards move to the side, go back into the screen (translateZ) and
//   turn 50° toward the middle (rotateY), like pages of an open book
function coverFlow(offset) {
  if (offset === 0) return 'translateX(0) translateZ(0) rotateY(0deg)'
  const side = offset < 0 ? -1 : 1 // -1 = left, 1 = right
  const distance = Math.abs(offset)
  const x = side * (60 + (distance - 1) * 22) // in % of the card width
  const z = -150 - (distance - 1) * 60 // in px, negative = further away
  const turn = -side * 50 // left cards turn right, right cards turn left
  return `translateX(${x}%) translateZ(${z}px) rotateY(${turn}deg)`
}

// Cards in 3D "cover flow": the middle card faces you, the others turn
// toward it. Used for movies and for the Clubs & you choices (same card shape,
// see data/MovieVerseCards.js).
// active = false while a popup is open on top (then the keys do nothing).
export default function MovieVerseCardStack({
  title,
  cards,
  emptyText,
  active,
  onOpen,
  onClose,
}) {
  const [index, setIndex] = useState(0)
  const current = clampIndex(index, cards.length)

  // move step cards (-1 = left, 1 = right).
  // setIndex((old) => ...) uses the newest index, so two fast key presses
  // really move two cards (not the same card twice).
  function go(step) {
    setIndex((old) => clampIndex(old + step, cards.length))
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
          {cards.length === 0 ? 0 : current + 1} / {cards.length}
        </span>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {cards.length === 0 && <div className="empty-state">{emptyText}</div>}

      <div className="card-stack-track">
        {cards.map((card, i) => {
          const offset = i - current
          if (Math.abs(offset) > SIDE_CARDS) return null
          return (
            <button
              key={card.id}
              className={'stack-card' + (offset === 0 ? ' center' : '')}
              style={{
                transform: coverFlow(offset),
                zIndex: 10 - Math.abs(offset), // the middle card is on top
              }}
              onClick={() => (offset === 0 ? onOpen(card) : setIndex(i))}
            >
              <div className={'stack-poster poster-' + card.color}>
                <MoviePosterImage src={card.poster} title={card.title} />
                <span className="poster-emoji">{card.emoji}</span>
              </div>
              <b>{card.title}</b>
              <small>{card.sub}</small>
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

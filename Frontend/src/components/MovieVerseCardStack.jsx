import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { clampIndex } from '../utils/clampIndex'
import { coverFlow } from '../utils/coverFlow'

const SIDE_CARDS = 3
const STEP_KEYS = { arrowleft: -1, a: -1, arrowright: 1, d: 1 }
const OPEN_KEYS = ['e', 'f', 'enter'] // open the middle card

// active = false → popup on top, keys do nothing
export default function MovieVerseCardStack({
  title,
  theme,
  cards,
  emptyText,
  active,
  onOpen,
  onClose,
}) {
  const [index, setIndex] = useState(0)
  const current = clampIndex(index, cards.length)

  // (old) => ... uses newest index → 2 fast presses = 2 cards
  function go(step) {
    setIndex((old) => clampIndex(old + step, cards.length))
  }

  useEffect(() => {
    if (!active) return undefined
    function handleKey(e) {
      if (e.target.matches?.('input, textarea')) return // typing in search
      const key = e.key.toLowerCase()
      // Enter on a card = that card's own click, not this
      const onCard = key === 'enter' && e.target.closest?.('.card-stack button')
      if (key in STEP_KEYS) {
        go(STEP_KEYS[key])
      } else if (OPEN_KEYS.includes(key) && !onCard && cards[current]) {
        e.preventDefault()
        onOpen(cards[current])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  // wheel: max 1 card per 250 ms
  const lastWheel = useRef(0)
  function handleWheel(e) {
    const amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(amount) < 10 || Date.now() - lastWheel.current < 250) return
    lastWheel.current = Date.now()
    go(amount > 0 ? 1 : -1)
  }

  // swipe: compare x on down vs up (> 50 px = swipe)
  const dragStart = useRef(null)
  const swiped = useRef(false)
  function handlePointerUp(e) {
    if (dragStart.current === null) return
    const moved = e.clientX - dragStart.current
    dragStart.current = null
    swiped.current = Math.abs(moved) > 50
    if (swiped.current) go(moved < 0 ? 1 : -1)
  }
  // swipe also fires a click → ignore it (no accidental open)
  function ignoreClickAfterSwipe(e) {
    if (!swiped.current) return
    swiped.current = false
    e.stopPropagation()
  }

  return (
    <div
      className={'card-stack theme-' + theme}
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
                zIndex: 10 - Math.abs(offset), // middle on top
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
        ← → · scroll · swipe to browse · E / F / Enter or click to open
      </p>
    </div>
  )
}

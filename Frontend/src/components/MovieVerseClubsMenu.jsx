import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { clampIndex } from '../utils/clampIndex'

// Menu of the "Clubs & you" place: 4 tiles in a 2 × 2 grid.
// Click a tile, or move with the arrow keys and press Enter.
// active = false while a popup is open on top (then the keys do nothing).
export default function MovieVerseClubsMenu({
  joined,
  watchlistCount,
  active,
  onChoose,
  onClose,
}) {
  const [index, setIndex] = useState(0) // which tile is selected

  // what the tiles show; onChoose(id) tells the page which one was picked
  const tiles = [
    {
      id: 'watchlist',
      icon: '♥',
      title: 'Watchlist',
      sub: watchlistCount + ' saved',
    },
    {
      id: 'communities',
      icon: '☰',
      title: 'Communities',
      sub: 'Find your people',
    },
    {
      id: 'studio',
      icon: '✦',
      title: 'Avatar studio',
      sub: 'Change your look',
    },
    {
      id: 'room',
      icon: '◎',
      title: 'Friday Film Club',
      sub: joined ? 'You are inside · leave' : 'Friend room · join',
    },
  ]

  // arrow keys move in the grid: left/right = 1 tile, up/down = 1 row (2 tiles)
  const steps = { arrowleft: -1, arrowright: 1, arrowup: -2, arrowdown: 2 }
  useEffect(() => {
    if (!active) return undefined
    function handleKey(e) {
      const key = e.key.toLowerCase()
      if (steps[key]) {
        e.preventDefault()
        setIndex(clampIndex(index + steps[key], tiles.length))
      }
      if (key === 'enter') {
        e.preventDefault()
        onChoose(tiles[index].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return (
    <div className="card-stack">
      <div className="card-stack-head">
        <h2>Clubs &amp; you</h2>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="clubs-menu">
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            className={'menu-tile' + (i === index ? ' selected' : '')}
            onClick={() => onChoose(tile.id)}
            onMouseEnter={() => setIndex(i)}
          >
            <span className={'menu-icon ' + tile.id}>{tile.icon}</span>
            <b>{tile.title}</b>
            <small>{tile.sub}</small>
          </button>
        ))}
      </div>

      <p className="card-stack-hint">
        click · or arrows + Enter · Esc to close
      </p>
    </div>
  )
}

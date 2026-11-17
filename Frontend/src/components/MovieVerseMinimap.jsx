import { WORLD, SPAWN, places, PLACE_SIZE } from '../data/MovieVerseWorldLayout'

// Small map in the corner: the 4 places (ovals) and you.
// It uses the same coordinates as the world, so the SVG viewBox is simply
// the size of the world. The "you" dot is moved by the game loop through
// dotRef (no re-render).
export default function MovieVerseMinimap({ zone, dotRef }) {
  return (
    <svg
      className="walk-minimap"
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      aria-hidden="true"
    >
      <rect
        width={WORLD.width}
        height={WORLD.height}
        rx="60"
        className="mm-bg"
      />
      {places.map((p) => (
        <ellipse
          key={p.id}
          cx={p.x}
          cy={p.y}
          rx={PLACE_SIZE.rx}
          ry={PLACE_SIZE.ry}
          className={'mm-area' + (zone === p.id ? ' current' : '')}
        />
      ))}
      <circle
        ref={dotRef}
        cx={SPAWN.x}
        cy={SPAWN.y}
        r="45"
        className="mm-you"
      />
    </svg>
  )
}

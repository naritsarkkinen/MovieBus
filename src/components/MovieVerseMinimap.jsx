import { WORLD, SPAWN, districts, lobby } from '../data/MovieVerseWorldLayout'

// Small map in the corner. It uses the same coordinates as the world,
// so the SVG viewBox is simply the size of the world.
// The "you" dot is moved by the game loop through dotRef (no re-render).
export default function MovieVerseMinimap({
  stands,
  zone,
  visibleIds,
  dotRef,
}) {
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
      <rect
        x={lobby.x}
        y={lobby.y}
        width={lobby.w}
        height={lobby.h}
        rx="40"
        className="mm-area"
      />
      {districts.map((d) => (
        <rect
          key={d.id}
          x={d.x}
          y={d.y}
          width={d.w}
          height={d.h}
          rx="40"
          className={'mm-area' + (zone === d.id ? ' current' : '')}
        />
      ))}
      {stands.map((s) => (
        <rect
          key={s.movie.id}
          x={s.x - 30}
          y={s.y - 30}
          width="60"
          height="60"
          rx="12"
          className={'mm-stand' + (visibleIds.has(s.movie.id) ? '' : ' dimmed')}
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

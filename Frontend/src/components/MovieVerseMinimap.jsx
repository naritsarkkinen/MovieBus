import { PLACE_SIZE } from '../data/MovieVerseWorldLayout'

// viewBox = map size → same coordinates. Dot is moved by the game loop (ref)
export default function MovieVerseMinimap({ map, zone, dotRef }) {
  return (
    <svg
      className="walk-minimap"
      viewBox={`0 0 ${map.width} ${map.height}`}
      aria-hidden="true"
    >
      <rect width={map.width} height={map.height} rx="60" className="mm-bg" />
      {map.places.map((p) => (
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
        cx={map.spawn.x}
        cy={map.spawn.y}
        r="45"
        className="mm-you"
      />
    </svg>
  )
}

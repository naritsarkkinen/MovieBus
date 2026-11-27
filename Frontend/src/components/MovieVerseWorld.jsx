import { useEffect, useRef, useState } from 'react'
import MovieVerseMinimap from './MovieVerseMinimap'
import MovieVerseControls from './MovieVerseControls'
import MovieVersePortal from './MovieVersePortal'
import { maps, placeAt, placeSpawn } from '../data/MovieVerseWorldLayout'

const SPEED = 330
const RUN_SPEED = 560
const REACH = 120
// player's spot on screen (same as .walk-plane in CSS)
const CAMERA_X = 0.5
const CAMERA_Y = 0.62
const MOVE_KEYS = {
  w: 'up',
  arrowup: 'up',
  s: 'down',
  arrowdown: 'down',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
  shift: 'run',
}
const ACTION_KEYS = ['enter', 'e', 'f', ' ']

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  )
}

// eslint-disable-next-line max-lines-per-function
export default function MovieVerseWorld({
  mapId,
  zone,
  onPlaceChange,
  name,
  avatar,
  skin,
  friends,
  invited,
  paused,
  onOpenFriend,
}) {
  const viewportRef = useRef(null)
  const planeRef = useRef(null)
  const playerRef = useRef(null)
  const minimapDotRef = useRef(null)
  const starsFarRef = useRef(null)
  const starsNearRef = useRef(null)
  const [nearest, setNearest] = useState(null)
  const map = maps[mapId]

  // hub = not invited friends, clubs = invited friends
  const friendsHere = friends
    .filter((f) => invited.has(f.name) === (mapId === 'clubs'))
    .map((f, i) => ({
      ...f,
      spot: map.friendSpots[i % map.friendSpots.length],
    }))

  // spot = something you can walk to and press F on
  const spots = friendsHere.map((f) => ({
    id: 'friend-' + f.name,
    ...f.spot,
    radius: 28,
    label: f.name,
    verb: 'Talk to',
    enabled: true,
    use: () => onOpenFriend(f),
  }))

  // ref, not state: changes 60x/s without re-rendering React
  const game = useRef({
    x: maps.hub.spawn.x,
    y: maps.hub.spawn.y,
    zoom: 1,
    keys: new Set(),
    target: null, // clicked point to walk to
    facingLeft: false,
    moving: false,
    place: null,
    nearestId: null,
    drawn: '', // last drawn position → skip drawing if same
  })
  const current = nearest && spots.find((s) => s.id === nearest.id)
  // loop runs once, so it reads fresh props from here
  const latest = useRef({})
  latest.current = { map, spots, onPlaceChange, nearest: current }

  // new map → start in the middle (not on a portal)
  const prevMap = useRef(mapId)
  useEffect(() => {
    if (prevMap.current === mapId) return
    prevMap.current = mapId
    const g = game.current
    g.x = map.spawn.x
    g.y = map.spawn.y
    g.place = null
    g.target = null
    g.keys.clear()
    g.drawn = '' // force redraw
  }, [mapId, map])

  // top bar zone click → jump to that place
  const prevZone = useRef(zone)
  useEffect(() => {
    const g = game.current
    if (prevZone.current === zone) return
    prevZone.current = zone
    if (g.place === zone) return
    const p = placeSpawn(map, zone)
    if (!p) return
    g.x = p.x
    g.y = p.y
    g.place = zone
  }, [zone, map])

  useEffect(() => {
    const g = game.current
    if (paused) {
      g.keys.clear()
      return undefined
    }
    const down = (e) => {
      if (isTyping(e.target)) return
      const key = e.key.toLowerCase()
      // Enter/Space on a button = press the button, not E/F-action
      const onButton =
        e.target instanceof HTMLElement && e.target.closest('button')
      const letterKey = key === 'e' || key === 'f'
      if (MOVE_KEYS[key]) {
        e.preventDefault()
        g.keys.add(MOVE_KEYS[key])
      } else if (
        ACTION_KEYS.includes(key) &&
        latest.current.nearest &&
        (letterKey || !onButton)
      ) {
        e.preventDefault()
        latest.current.nearest.use()
      }
    }
    const up = (e) => {
      const key = e.key.toLowerCase()
      if (MOVE_KEYS[key]) g.keys.delete(MOVE_KEYS[key])
    }
    const clear = () => g.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [paused])

  // small screen → zoom out
  useEffect(() => {
    const fit = () => {
      const w = viewportRef.current?.clientWidth || window.innerWidth
      game.current.zoom = w < 600 ? 0.7 : w < 1000 ? 0.85 : 1
      game.current.drawn = ''
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // GAME LOOP: tick() ~60x/s → move, stay in map, place?, nearest?, draw
  useEffect(() => {
    function draw(g) {
      // camera: move the map opposite → player stays in the middle
      planeRef.current.style.transform = `scale(${g.zoom}) translate(${-g.x}px, ${-g.y}px)`

      const player = playerRef.current
      player.style.transform = `translate(${g.x}px, ${g.y}px) translate(-50%, -100%)`
      player.style.zIndex = Math.round(g.y) // lower = in front
      player.classList.toggle('walking', g.moving)
      player.classList.toggle('facing-left', g.facingLeft)

      minimapDotRef.current.setAttribute('cx', Math.round(g.x))
      minimapDotRef.current.setAttribute('cy', Math.round(g.y))

      // parallax: slower stars look further away
      starsFarRef.current.style.transform = starShift(g, 0.1, 200)
      starsNearRef.current.style.transform = starShift(g, 0.25, 320)
    }

    let frame
    let last = performance.now()

    function tick(now) {
      // dt = seconds since last frame (max 0.05 → no big jumps)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = game.current
      const { map, spots } = latest.current

      // 1. move
      const direction = moveDirection(g)
      g.moving = direction.x !== 0 || direction.y !== 0
      if (g.moving) movePlayer(g, direction, dt)

      // 2. stay in map
      stayInsideMap(g, map)

      // 3. stepped on/off a place → tell the page
      const here = placeAt(map, g.x, g.y)
      const hereId = here ? here.id : null
      if (hereId !== g.place) {
        g.place = hereId
        latest.current.onPlaceChange(hereId)
      }

      // 4. closest spot gets the "F" prompt
      const best = nearestSpot(g, spots)
      const bestId = best ? best.id : null
      if (bestId !== g.nearestId) {
        g.nearestId = bestId
        setNearest(best) // only React update in the loop
      }

      // 5. draw only if something changed
      const position = `${g.x},${g.y},${g.zoom},${g.moving},${g.facingLeft}`
      if (position !== g.drawn) {
        g.drawn = position
        draw(g)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // screen click → map coordinates (undo camera + zoom)
  function walkToPointer(e) {
    if (paused || e.button > 0) return
    if (e.target instanceof Element && e.target.closest('button')) return
    const rect = viewportRef.current.getBoundingClientRect()
    const g = game.current
    g.target = {
      x: g.x + (e.clientX - rect.left - rect.width * CAMERA_X) / g.zoom,
      y: g.y + (e.clientY - rect.top - rect.height * CAMERA_Y) / g.zoom,
    }
  }

  return (
    <div
      ref={viewportRef}
      className={'walk-world map-' + mapId}
      onPointerDown={walkToPointer}
    >
      <div ref={starsFarRef} className="walk-stars far" />
      <div ref={starsNearRef} className="walk-stars near" />
      <div
        ref={planeRef}
        className="walk-plane"
        style={{ width: map.width, height: map.height }}
      >
        <div
          className="walk-hub earth"
          style={{ left: map.spawn.x, top: map.spawn.y }}
        >
          <span />
          <span />
          <span />
        </div>
        {map.places.map((p) =>
          p.portal ? (
            <MovieVersePortal key={p.id} place={p} current={zone === p.id} />
          ) : (
            <div
              key={p.id}
              className={'walk-place' + (zone === p.id ? ' current' : '')}
              style={{ left: p.x, top: p.y }}
            >
              <span className="walk-place-ring" />
              <span className="walk-place-icon">{p.icon}</span>
              <b>{p.label}</b>
            </div>
          ),
        )}

        <div
          className="billboard walk-sign"
          style={{ left: map.sign.x, top: map.sign.y, zIndex: map.sign.y }}
        >
          <span className="eyebrow">{map.sign.eyebrow}</span>
          <b>{map.sign.title}</b>
          <small>{map.sign.sub}</small>
        </div>

        {friendsHere.map((f) => {
          const isNear = current?.id === 'friend-' + f.name
          return (
            <button
              key={f.name}
              className={'billboard walk-friend' + (isNear ? ' near' : '')}
              style={{ left: f.spot.x, top: f.spot.y, zIndex: f.spot.y }}
              onClick={() => onOpenFriend(f)}
            >
              <div className="player-bubble">
                {f.name} ·{' '}
                {mapId === 'clubs' ? 'In Friday Film Club' : f.status}
              </div>
              <div className={'friend-avatar ' + f.color}>{f.initial}</div>
              <span className="player-shadow" />
            </button>
          )
        })}

        <div ref={playerRef} className="billboard walk-player">
          <div className="player-bubble">{name}</div>
          <div className={'player-avatar skin-' + skin}>
            <span>{avatar}</span>
          </div>
          <span className="player-shadow" />
        </div>
      </div>

      <MovieVerseMinimap map={map} zone={zone} dotRef={minimapDotRef} />
      <MovieVerseControls
        onPress={(direction) => game.current.keys.add(direction)}
        onRelease={(direction) => game.current.keys.delete(direction)}
      />

      {current && !paused && (
        <button className="walk-prompt" onClick={() => current.use()}>
          <span className="walk-prompt-key">E</span>
          <span>
            <small>{current.verb.toUpperCase()}</small>
            <b>{current.label}</b>
          </span>
        </button>
      )}
    </div>
  )
}

// keys win over click. {1,0} = right, {0,0} = stand
function moveDirection(g) {
  const keyX = (g.keys.has('right') ? 1 : 0) - (g.keys.has('left') ? 1 : 0)
  const keyY = (g.keys.has('down') ? 1 : 0) - (g.keys.has('up') ? 1 : 0)
  if (keyX !== 0 || keyY !== 0) {
    g.target = null
    return { x: keyX, y: keyY }
  }
  if (!g.target) return { x: 0, y: 0 }

  const toTarget = { x: g.target.x - g.x, y: g.target.y - g.y }
  if (Math.hypot(toTarget.x, toTarget.y) < 8) {
    g.target = null
    return { x: 0, y: 0 }
  }
  return toTarget
}

// divide by length → diagonal is not faster
function movePlayer(g, direction, dt) {
  const length = Math.hypot(direction.x, direction.y)
  const speed = g.keys.has('run') ? RUN_SPEED : SPEED
  g.x += (direction.x / length) * speed * dt
  g.y += (direction.y / length) * speed * dt
  if (direction.x !== 0) g.facingLeft = direction.x < 0
}

// pattern repeats every tile px → % tile = endless stars
function starShift(g, speed, tile) {
  const x = -(g.x * speed) % tile
  const y = -(g.y * speed) % tile
  return `translate(${x}px, ${y}px)`
}

function stayInsideMap(g, map) {
  g.x = Math.max(40, Math.min(map.width - 40, g.x))
  g.y = Math.max(60, Math.min(map.height - 40, g.y))
}

// closest spot within REACH (s.y + 40 = in front of it)
function nearestSpot(g, spots) {
  let best = null
  let bestDistance = REACH
  for (const s of spots) {
    if (!s.enabled) continue
    const distance = Math.hypot(g.x - s.x, g.y - (s.y + 40)) - s.radius / 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = s
    }
  }
  return best
}

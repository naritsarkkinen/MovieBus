import { useEffect, useRef, useState } from 'react'
import MovieVerseMinimap from './MovieVerseMinimap'
import MovieVerseControls from './MovieVerseControls'
import MovieVersePortal from './MovieVersePortal'
import {
  maps,
  placeAt,
  placeSpawn,
  pathTo,
} from '../data/MovieVerseWorldLayout'

const SPEED = 330
const RUN_SPEED = 560
const REACH = 120
// where the player sits on screen (matches .walk-plane left / top in CSS)
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
const ACTION_KEYS = ['enter', 'f', ' ']

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  )
}

// The walkable world. mapId says which map ("dimension") you are in:
// 'hub' or 'clubs' (see data/MovieVerseWorldLayout.js).
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

  // Which friends are in this map: in the hub the friends you have not
  // invited yet, in your dimension the ones you invited to Friday Film Club.
  const friendsHere = friends
    .filter((f) => invited.has(f.name) === (mapId === 'clubs'))
    .map((f, i) => ({
      ...f,
      spot: map.friendSpots[i % map.friendSpots.length],
    }))

  // "spots" = things you can walk up to and use (the friends here).
  // Nothing is solid: you walk through people, so a crowd can never
  // block anyone. radius = how big it is, enabled = can you use it.
  const spots = friendsHere.map((f) => ({
    id: 'friend-' + f.name,
    ...f.spot,
    radius: 28,
    label: f.name,
    verb: 'Talk to',
    enabled: true,
    use: () => onOpenFriend(f),
  }))

  // all mutable game state lives in a ref so moving does not re-render React
  const game = useRef({
    x: maps.hub.spawn.x,
    y: maps.hub.spawn.y,
    zoom: 1,
    keys: new Set(),
    target: null, // where a click / tap asked us to walk
    facingLeft: false,
    moving: false,
    place: null, // id of the place we stand on, or null
    nearestId: null,
    drawn: '', // last position written to the screen
  })
  // re-read the spot every render so its action is never stale
  const current = nearest && spots.find((s) => s.id === nearest.id)
  const latest = useRef({})
  latest.current = { map, spots, onPlaceChange, nearest: current }

  // travelled to another map: put the player at its arrival point
  // (back in the hub you land next to the Clubs portal: returnSpawn)
  const prevMap = useRef(mapId)
  useEffect(() => {
    if (prevMap.current === mapId) return
    prevMap.current = mapId
    const g = game.current
    const arrive = map.returnSpawn || map.spawn
    g.x = arrive.x
    g.y = arrive.y
    g.place = null
    g.target = null
    g.drawn = '' // draw again even if the numbers happen to be the same
  }, [mapId, map])

  // jump to a place when a zone is picked in the top bar
  // (runs after the map effect above, so it uses the new map)
  const prevZone = useRef(zone)
  useEffect(() => {
    const g = game.current
    if (prevZone.current === zone) return
    prevZone.current = zone
    if (g.place === zone) return // already standing there
    const p = placeSpawn(map, zone)
    if (!p) return // this map does not have that place
    g.x = p.x
    g.y = p.y
    g.place = zone // the page opens it itself, no need to tell it again
  }, [zone, map])

  // keyboard
  useEffect(() => {
    const g = game.current
    if (paused) {
      g.keys.clear()
      return undefined
    }
    const down = (e) => {
      if (isTyping(e.target)) return
      const key = e.key.toLowerCase()
      // Enter / Space on a focused button should just press that button
      const onButton =
        e.target instanceof HTMLElement && e.target.closest('button')
      if (MOVE_KEYS[key]) {
        e.preventDefault()
        g.keys.add(MOVE_KEYS[key])
      } else if (
        ACTION_KEYS.includes(key) &&
        latest.current.nearest &&
        (key === 'f' || !onButton)
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

  // smaller screens see more of the map
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

  // game loop: the browser calls tick() about 60 times per second
  useEffect(() => {
    // moves the map, the player and the minimap dot on the screen
    function draw(g) {
      // the camera: move the map the other way so the player stays centred
      planeRef.current.style.transform = `scale(${g.zoom}) translate(${-g.x}px, ${-g.y}px)`

      const player = playerRef.current
      player.style.transform = `translate(${g.x}px, ${g.y}px) translate(-50%, -100%)`
      player.style.zIndex = Math.round(g.y) // lower on screen = in front
      player.classList.toggle('walking', g.moving)
      player.classList.toggle('facing-left', g.facingLeft)

      minimapDotRef.current.setAttribute('cx', Math.round(g.x))
      minimapDotRef.current.setAttribute('cy', Math.round(g.y))

      // parallax: the stars move slower than the floor, so they look far
      // away (far stars 10 % of your speed, near stars 25 %)
      starsFarRef.current.style.backgroundPosition = `${-g.x * 0.1}px ${-g.y * 0.1}px`
      starsNearRef.current.style.backgroundPosition = `${-g.x * 0.25}px ${-g.y * 0.25}px`
    }

    let frame
    let last = performance.now()

    function tick(now) {
      // seconds since the last frame (max 0.05 so a slow frame is no big jump)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = game.current
      const { map, spots } = latest.current

      // 1. move towards the pressed keys or the clicked point
      const direction = moveDirection(g)
      g.moving = direction.x !== 0 || direction.y !== 0
      if (g.moving) movePlayer(g, direction, dt)

      // 2. do not walk out of the map
      stayInsideMap(g, map)

      // 3. tell the page when we step onto a place (or off it)
      const here = placeAt(map, g.x, g.y)
      const hereId = here ? here.id : null
      if (hereId !== g.place) {
        g.place = hereId
        latest.current.onPlaceChange(hereId)
      }

      // 4. the closest thing we can use gets the "Press F" prompt
      const best = nearestSpot(g, spots)
      const bestId = best ? best.id : null
      if (bestId !== g.nearestId) {
        g.nearestId = bestId
        setNearest(best) // only this re-renders React, and only on change
      }

      // 5. draw, but only when something changed (saves battery on phones)
      const position = `${g.x},${g.y},${g.zoom},${g.moving},${g.facingLeft}`
      if (position !== g.drawn) {
        g.drawn = position
        draw(g)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame) // stop the loop when the page closes
  }, [])

  // click / tap on the floor: walk there
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
      {/* space: two star layers that move at different speeds (parallax) */}
      <div ref={starsFarRef} className="walk-stars far" />
      <div ref={starsNearRef} className="walk-stars near" />
      <div
        ref={planeRef}
        className="walk-plane"
        style={{ width: map.width, height: map.height }}
      >
        {/* floor: spacetime grid, paths, the spawn platform and the places */}
        <div className="walk-ground" />
        {map.paths &&
          map.places.map((p) => (
            <div key={p.id} className="walk-path" style={pathTo(map, p)} />
          ))}
        <div
          className="walk-hub"
          style={{ left: map.spawn.x, top: map.spawn.y }}
        />
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

        {/* sign above the spawn point */}
        <div
          className="billboard walk-sign"
          style={{ left: map.sign.x, top: map.sign.y, zIndex: map.sign.y }}
        >
          <span className="eyebrow">{map.sign.eyebrow}</span>
          <b>{map.sign.title}</b>
          <small>{map.sign.sub}</small>
        </div>

        {/* friends (simulated): walk up and talk */}
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

        {/* you */}
        <div ref={playerRef} className="billboard walk-player">
          <div className="player-bubble">{name}</div>
          <div className={'player-avatar skin-' + skin}>
            <span>{avatar}</span>
          </div>
          <span className="player-shadow" />
        </div>
      </div>

      {/* on top of the world */}
      <MovieVerseMinimap map={map} zone={zone} dotRef={minimapDotRef} />
      <MovieVerseControls
        onPress={(direction) => game.current.keys.add(direction)}
        onRelease={(direction) => game.current.keys.delete(direction)}
      />

      {current && !paused && (
        <button className="walk-prompt" onClick={() => current.use()}>
          <span className="walk-prompt-key">F</span>
          <span>
            <small>{current.verb.toUpperCase()}</small>
            <b>{current.label}</b>
          </span>
        </button>
      )}
    </div>
  )
}

// ----- game loop helpers (g = the game state object) -----

// Which way does the player want to go? Keys win over a clicked point.
// Returns { x, y }: e.g. { x: 1, y: 0 } = right, { x: 0, y: 0 } = stand still.
function moveDirection(g) {
  const keyX = (g.keys.has('right') ? 1 : 0) - (g.keys.has('left') ? 1 : 0)
  const keyY = (g.keys.has('down') ? 1 : 0) - (g.keys.has('up') ? 1 : 0)
  if (keyX !== 0 || keyY !== 0) {
    g.target = null // pressing a key cancels the click target
    return { x: keyX, y: keyY }
  }
  if (!g.target) return { x: 0, y: 0 }

  const toTarget = { x: g.target.x - g.x, y: g.target.y - g.y }
  if (Math.hypot(toTarget.x, toTarget.y) < 8) {
    g.target = null // arrived
    return { x: 0, y: 0 }
  }
  return toTarget
}

// Moves the player. The direction is divided by its length so walking
// diagonally is not faster than walking straight.
function movePlayer(g, direction, dt) {
  const length = Math.hypot(direction.x, direction.y)
  const speed = g.keys.has('run') ? RUN_SPEED : SPEED
  g.x += (direction.x / length) * speed * dt
  g.y += (direction.y / length) * speed * dt
  if (direction.x !== 0) g.facingLeft = direction.x < 0
}

// Keeps the player inside the map (40 px away from the edges).
function stayInsideMap(g, map) {
  g.x = Math.max(40, Math.min(map.width - 40, g.x))
  g.y = Math.max(60, Math.min(map.height - 40, g.y))
}

// The closest enabled spot within REACH pixels, or null.
// (s.y + 40 = measure from just in front of the spot, where you stand)
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

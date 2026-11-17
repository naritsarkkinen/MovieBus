import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { formatRating } from '../api/movies'
import {
  WORLD,
  SPAWN,
  districts,
  lobby,
  lobbySpots,
  friendSpots,
  roomFriendSpots,
  districtAt,
  districtSpawn,
  placeMovies,
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

// eslint-disable-next-line max-lines-per-function, complexity
export default function MovieVerseWorld({
  movies,
  visibleIds,
  zones,
  zone,
  onDistrictChange,
  name,
  avatar,
  skin,
  friends,
  joined,
  invited,
  watchlistCount,
  paused,
  onOpenMovie,
  onOpenProfile,
  onToggleRoom,
  onOpenFriend,
  onOpenCommunities,
  onOpenWatchlist,
}) {
  const viewportRef = useRef(null)
  const planeRef = useRef(null)
  const playerRef = useRef(null)
  const minimapDotRef = useRef(null)
  const [nearest, setNearest] = useState(null)

  const stands = useMemo(() => placeMovies(movies), [movies])

  // things you can walk up to and use
  const spots = useMemo(() => {
    const list = stands.map((s) => ({
      id: 'movie-' + s.movie.id,
      x: s.x,
      y: s.y,
      radius: 48,
      label: s.movie.title,
      verb: 'Open movie',
      enabled: visibleIds.has(s.movie.id),
      use: () => onOpenMovie(s.movie),
    }))
    list.push(
      {
        id: 'studio',
        ...lobbySpots.studio,
        radius: 70,
        label: 'Avatar studio',
        verb: 'Customize',
        enabled: true,
        use: onOpenProfile,
      },
      {
        id: 'room',
        ...lobbySpots.room,
        radius: 70,
        label: 'Friday Film Club',
        verb: joined ? 'Leave room' : 'Join room',
        enabled: true,
        use: onToggleRoom,
      },
      {
        id: 'shelf',
        ...lobbySpots.shelf,
        radius: 70,
        label: 'Your watchlist',
        verb: 'Open',
        enabled: true,
        use: onOpenWatchlist,
      },
      {
        id: 'board',
        ...lobbySpots.board,
        radius: 70,
        label: 'Communities',
        verb: 'Browse',
        enabled: true,
        use: onOpenCommunities,
      },
      {
        id: 'sign',
        ...lobbySpots.sign,
        radius: 90,
        enabled: false,
      },
    )
    friends.forEach((f, i) =>
      list.push({
        id: 'friend-' + f.name,
        ...friendPosition(i, invited.has(f.name)),
        radius: 28,
        label: f.name,
        verb: 'Talk to',
        enabled: true,
        use: () => onOpenFriend(f),
      }),
    )
    return list
  }, [
    stands,
    visibleIds,
    joined,
    friends,
    invited,
    onOpenMovie,
    onOpenProfile,
    onToggleRoom,
    onOpenFriend,
    onOpenCommunities,
    onOpenWatchlist,
  ])

  // all mutable game state lives in a ref so moving does not re-render React
  const game = useRef({
    x: SPAWN.x,
    y: SPAWN.y,
    zoom: 1,
    keys: new Set(),
    target: null, // where a click / tap asked us to walk
    facingLeft: false,
    moving: false,
    district: null,
    nearestId: null,
    drawn: '', // last position written to the screen
  })
  // re-read the spot every render so its action is never stale
  const current = nearest && spots.find((s) => s.id === nearest.id)
  const latest = useRef({})
  latest.current = { spots, onDistrictChange, nearest: current }

  // teleport when a zone is picked from the sidebar / arrows
  // (starts as the current zone, so you spawn in the lobby, not a district)
  const prevZone = useRef(zone)
  useEffect(() => {
    const g = game.current
    if (prevZone.current === zone) return
    prevZone.current = zone
    if (g.district === zone) return
    const p = districtSpawn(zone)
    g.x = p.x
    g.y = p.y
    g.district = zone
  }, [zone])

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

  // game loop
  useEffect(() => {
    let frame
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const g = game.current
      const { spots: allSpots } = latest.current
      const k = g.keys

      // 1. which way do we want to go? (keys win over a click target)
      let mx = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0)
      let my = (k.has('down') ? 1 : 0) - (k.has('up') ? 1 : 0)
      if (mx || my) {
        g.target = null
      } else if (g.target) {
        mx = g.target.x - g.x
        my = g.target.y - g.y
        if (Math.hypot(mx, my) < 8) {
          g.target = null
          mx = 0
          my = 0
        }
      }

      // 2. move
      g.moving = mx !== 0 || my !== 0
      if (g.moving) {
        const len = Math.hypot(mx, my)
        const speed = k.has('run') ? RUN_SPEED : SPEED
        g.x += (mx / len) * speed * dt
        g.y += (my / len) * speed * dt
        if (Math.abs(mx) > 0.01) g.facingLeft = mx < 0
      }

      // 3. bump into stands, booths and friends (circle collision)
      for (const s of allSpots) {
        const dx = g.x - s.x
        const dy = g.y - s.y
        const d = Math.hypot(dx, dy)
        const min = s.radius + 20
        if (d < min && d > 0.001) {
          g.x = s.x + (dx / d) * min
          g.y = s.y + (dy / d) * min
          g.target = null // walked into something: stop here
        }
      }
      g.x = Math.max(40, Math.min(WORLD.width - 40, g.x))
      g.y = Math.max(60, Math.min(WORLD.height - 40, g.y))

      // 4. which district are we in?
      const here = districtAt(g.x, g.y)
      if (here && here.id !== g.district) {
        g.district = here.id
        latest.current.onDistrictChange(here.id)
      } else if (!here) {
        g.district = null
      }

      // 5. closest thing we can use
      let best = null
      let bestD = REACH
      for (const s of allSpots) {
        if (!s.enabled) continue
        const d = Math.hypot(g.x - s.x, g.y - (s.y + 40)) - s.radius / 2
        if (d < bestD) {
          bestD = d
          best = s
        }
      }
      const bestId = best ? best.id : null
      if (bestId !== g.nearestId) {
        g.nearestId = bestId
        setNearest(best)
      }

      // 6. draw, but only when something changed (saves battery on phones)
      const key = `${g.x.toFixed(1)},${g.y.toFixed(1)},${g.zoom},${g.moving},${g.facingLeft}`
      if (key !== g.drawn) {
        g.drawn = key
        if (planeRef.current) {
          // the camera: move the map the other way so the player stays centred
          planeRef.current.style.transform = `scale(${g.zoom}) translate3d(${(-g.x).toFixed(1)}px, ${(-g.y).toFixed(1)}px, 0)`
        }
        if (playerRef.current) {
          const p = playerRef.current
          p.style.transform = `translate3d(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px, 0) translate(-50%, -100%)`
          p.style.zIndex = Math.round(g.y)
          p.classList.toggle('walking', g.moving)
          p.classList.toggle('facing-left', g.facingLeft)
        }
        if (minimapDotRef.current) {
          minimapDotRef.current.setAttribute('cx', g.x.toFixed(0))
          minimapDotRef.current.setAttribute('cy', g.y.toFixed(0))
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
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

  const zoneName = (id) => zones.find((z) => z.id === id)?.name || id

  return (
    <div ref={viewportRef} className="walk-world" onPointerDown={walkToPointer}>
      <div className="walk-sky" />
      <div
        ref={planeRef}
        className="walk-plane"
        style={{ width: WORLD.width, height: WORLD.height }}
      >
        {/* floor */}
        <div className="walk-ground" />
        <div
          className="walk-area walk-lobby"
          style={{
            left: lobby.x,
            top: lobby.y,
            width: lobby.w,
            height: lobby.h,
          }}
        >
          <span className="walk-floor-label">THE LOBBY</span>
        </div>
        {districts.map((d) => (
          <div
            key={d.id}
            className={
              'walk-area walk-district district-' +
              d.id +
              (zone === d.id ? ' current' : '')
            }
            style={{ left: d.x, top: d.y, width: d.w, height: d.h }}
          >
            <span className="walk-floor-label">
              {zoneName(d.id).toUpperCase()}
            </span>
          </div>
        ))}
        <div className="walk-path path-a" />
        <div className="walk-path path-b" />
        <div className="walk-path path-c" />

        {/* movie stands (Fragment, not a div: a wrapper div would flatten them) */}
        {stands.map((s) => {
          const enabled = visibleIds.has(s.movie.id)
          const isNear = current?.id === 'movie-' + s.movie.id
          return (
            <Fragment key={s.movie.id}>
              <div
                className={'walk-pad' + (isNear ? ' near' : '')}
                style={{ left: s.x, top: s.y }}
              />
              <button
                className={
                  'billboard walk-stand' +
                  (enabled ? '' : ' dimmed') +
                  (isNear ? ' near' : '')
                }
                style={{ left: s.x, top: s.y, zIndex: s.y }}
                disabled={!enabled}
                onClick={() => onOpenMovie(s.movie)}
              >
                <div className={'poster poster-' + s.movie.color}>
                  <MoviePosterImage
                    src={s.movie.poster}
                    title={s.movie.title}
                  />
                  <span className="poster-tag">{s.movie.tag}</span>
                  <span className="poster-emoji">{s.movie.emoji}</span>
                  <b>{s.movie.title}</b>
                  <small>
                    {s.movie.year} · {s.movie.genre}
                  </small>
                  <span className="poster-rating">
                    <Star size={12} fill="currentColor" />
                    {formatRating(s.movie.rating)}
                  </span>
                </div>
              </button>
            </Fragment>
          )
        })}

        {/* lobby */}
        <div
          className="billboard walk-sign"
          style={{
            left: lobbySpots.sign.x,
            top: lobbySpots.sign.y,
            zIndex: lobbySpots.sign.y,
          }}
        >
          <span className="eyebrow">YOUR PERSONAL CINEMA DIMENSION</span>
          <b>
            Explore beyond <em>the screen.</em>
          </b>
          <small>Walk up to a movie and press F to open it</small>
        </div>
        <Booth
          spot={lobbySpots.studio}
          near={current?.id === 'studio'}
          icon="✦"
          title="Avatar studio"
          sub="Change your look"
          onUse={onOpenProfile}
        />
        <Booth
          spot={lobbySpots.room}
          near={current?.id === 'room'}
          className={'room' + (joined ? ' joined' : '')}
          icon="◎"
          title="Friday Film Club"
          sub={joined ? 'You are inside' : 'Friend room · join'}
          onUse={onToggleRoom}
        />
        <Booth
          spot={lobbySpots.shelf}
          near={current?.id === 'shelf'}
          className="shelf"
          icon="♥"
          title="Watchlist"
          sub={watchlistCount + ' saved'}
          onUse={onOpenWatchlist}
        />
        <Booth
          spot={lobbySpots.board}
          near={current?.id === 'board'}
          className="board"
          icon="☰"
          title="Communities"
          sub="Find your people"
          onUse={onOpenCommunities}
        />

        {/* friends (simulated): walk up and talk, invited friends go to the room */}
        {friends.map((f, i) => {
          const spot = friendPosition(i, invited.has(f.name))
          const isNear = current?.id === 'friend-' + f.name
          return (
            <button
              key={f.name}
              className={'billboard walk-friend' + (isNear ? ' near' : '')}
              style={{ left: spot.x, top: spot.y, zIndex: spot.y }}
              onClick={() => onOpenFriend(f)}
            >
              <div className="player-bubble">
                {f.name} ·{' '}
                {invited.has(f.name) ? 'In Friday Film Club' : f.status}
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

      {/* HUD */}
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
            className={'mm-area mm-' + d.id + (zone === d.id ? ' current' : '')}
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
            className={
              'mm-stand' + (visibleIds.has(s.movie.id) ? '' : ' dimmed')
            }
          />
        ))}
        <circle
          ref={minimapDotRef}
          cx={SPAWN.x}
          cy={SPAWN.y}
          r="45"
          className="mm-you"
        />
      </svg>

      <div className="walk-help">
        <b>MOVE AROUND</b>
        <span>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> walk · <kbd>Shift</kbd> run
        </span>
        <span>
          <kbd>F</kbd> / <kbd>Enter</kbd> use · or click
        </span>
        <span>or click the floor to walk there</span>
      </div>

      {current && !paused && (
        <button className="walk-prompt" onClick={() => current.use()}>
          <span className="walk-prompt-key">F</span>
          <span>
            <small>{current.verb.toUpperCase()}</small>
            <b>{current.label}</b>
          </span>
        </button>
      )}

      <div className="walk-pad-controls">
        {[
          ['up', '▲'],
          ['left', '◀'],
          ['down', '▼'],
          ['right', '▶'],
        ].map(([action, icon]) => (
          <button
            key={action}
            aria-label={action}
            className={'pad-' + action}
            onPointerDown={(e) => {
              e.stopPropagation()
              game.current.keys.add(action)
            }}
            onPointerUp={() => game.current.keys.delete(action)}
            onPointerLeave={() => game.current.keys.delete(action)}
            onPointerCancel={() => game.current.keys.delete(action)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

function friendPosition(index, inRoom) {
  const list = inRoom ? roomFriendSpots : friendSpots
  return list[index % list.length]
}

function Booth({ spot, near, className = '', icon, title, sub, onUse }) {
  return (
    <>
      <div className={'walk-pad big' + (near ? ' near' : '')} style={spot} />
      <button
        className={'billboard walk-booth ' + className + (near ? ' near' : '')}
        style={{ left: spot.x, top: spot.y, zIndex: spot.y }}
        onClick={onUse}
      >
        <span className="booth-icon">{icon}</span>
        <b>{title}</b>
        <small>{sub}</small>
      </button>
    </>
  )
}

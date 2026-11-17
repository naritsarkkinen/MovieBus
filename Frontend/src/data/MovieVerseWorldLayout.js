// The maps ("dimensions") of the MovieVerse, in world pixels.
// (0, 0) is the top-left corner of a map, x grows right, y grows down.
//
// hub   = the shared space where everyone spawns. 4 portals lead to the
//         dimensions: 3 movie dimensions and your own Clubs & you dimension.
// clubs = your own dimension: only your stuff, and a portal back to the hub.
//
// A place with `portal` is an upright dimension door (the value is its look).
// A place without it is a flat glowing "station" on the floor.
export const maps = {
  hub: {
    id: 'hub',
    width: 2800,
    height: 2000,
    spawn: { x: 1400, y: 1000 }, // the middle
    returnSpawn: { x: 1400, y: 1420 }, // coming back from your dimension
    sign: {
      x: 1400,
      y: 860,
      eyebrow: 'THE MOVIEVERSE HUB',
      title: 'Pick a dimension.',
      sub: 'Walk into a portal to travel',
    },
    places: [
      {
        id: 'discover',
        x: 1400,
        y: 380,
        label: 'Discover',
        icon: '◈',
        portal: 'glitch',
      },
      {
        id: 'trending',
        x: 760,
        y: 1000,
        label: 'Trending',
        icon: '✦',
        portal: 'hex',
      },
      {
        id: 'community',
        x: 2040,
        y: 1000,
        label: 'Community',
        icon: '◎',
        portal: 'galaxy',
      },
      {
        id: 'clubs',
        x: 1400,
        y: 1620,
        label: 'Clubs & you',
        icon: '♥',
        portal: 'rings',
      },
    ],
    // friends you have not invited yet hang around in the hub
    friendSpots: [
      { x: 1180, y: 1180 },
      { x: 1630, y: 1180 },
      { x: 1220, y: 760 },
    ],
  },
  clubs: {
    id: 'clubs',
    width: 1800,
    height: 1400,
    spawn: { x: 900, y: 660 },
    sign: {
      x: 900,
      y: 540,
      eyebrow: 'CLUBS & YOU',
      title: 'Your dimension.',
      sub: 'Only your own stuff lives here',
    },
    places: [
      { id: 'watchlist', x: 480, y: 420, label: 'Watchlist', icon: '♥' },
      { id: 'communities', x: 1320, y: 420, label: 'Communities', icon: '☰' },
      { id: 'studio', x: 480, y: 920, label: 'Avatar studio', icon: '✦' },
      { id: 'room', x: 1320, y: 920, label: 'Friday Film Club', icon: '◎' },
      {
        id: 'hub',
        x: 900,
        y: 1200,
        label: 'Back to the hub',
        icon: '⬡',
        portal: 'galaxy',
      },
    ],
    // friends you invited wait next to the Friday Film Club
    friendSpots: [
      { x: 1160, y: 1040 },
      { x: 1480, y: 1040 },
      { x: 1320, y: 1090 },
    ],
  },
}

// Every place is an oval on the floor (for a portal: its glowing base):
// 170 px from the middle to the left/right edge, 85 px to the top/bottom.
export const PLACE_SIZE = { rx: 170, ry: 85 }

// Is the point (x, y) inside the oval of place p?
// Oval formula: (dx / rx)² + (dy / ry)² < 1
export function isOnPlace(p, x, y) {
  const dx = (x - p.x) / PLACE_SIZE.rx
  const dy = (y - p.y) / PLACE_SIZE.ry
  return dx * dx + dy * dy < 1
}

// the place you are standing on in this map, or null
export function placeAt(map, x, y) {
  return map.places.find((p) => isOnPlace(p, x, y)) || null
}

// the middle of a place (for jumping there from the top bar),
// or null if this map does not have that place
export function placeSpawn(map, id) {
  const place = map.places.find((p) => p.id === id)
  return place ? { x: place.x, y: place.y } : null
}

// Every movie goes to one of the 3 movie dimensions:
// the best rated third -> Community, the next third -> Trending,
// the rest -> Discover.
export function splitMovies(movies) {
  const perPlace = Math.max(1, Math.ceil(movies.length / 3))
  const community = [...movies]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, perPlace)
  const rest = movies.filter((m) => !community.includes(m))
  return {
    trending: rest.slice(0, perPlace),
    discover: rest.slice(perPlace),
    community,
  }
}

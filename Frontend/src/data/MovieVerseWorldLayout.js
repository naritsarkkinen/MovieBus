// Layout of the MovieVerse hub, in world pixels.
// Like a game lobby: you spawn in the middle, and 4 straight paths lead to
// the 4 portals (north, west, east, south). About 2 s walking, 1 s running.
export const WORLD = { width: 2800, height: 2000 }

// you start in the middle of the hub
export const SPAWN = { x: 1400, y: 1000 }

// the 4 places around the hub (x, y = middle of the portal)
export const places = [
  { id: 'discover', x: 1400, y: 380 }, // north
  { id: 'trending', x: 760, y: 1000 }, // west
  { id: 'community', x: 2040, y: 1000 }, // east
  { id: 'clubs', x: 1400, y: 1620 }, // south
]

// Every place is an oval "portal" on the floor:
// 170 px from the middle to the left/right edge, 85 px to the top/bottom.
export const PLACE_SIZE = { rx: 170, ry: 85 }

// the welcome sign floats above the spawn point
export const SIGN = { x: 1400, y: 880 }

export const friendSpots = [
  { x: 1180, y: 1180 },
  { x: 1630, y: 1180 },
  { x: 1220, y: 800 },
]

// where friends go after you invite them to Friday Film Club
// (around the "Clubs & you" portal)
export const roomFriendSpots = [
  { x: 1180, y: 1740 },
  { x: 1620, y: 1740 },
  { x: 1400, y: 1800 },
]

// The glowing path from the spawn point to a place, as a rectangle.
// The places are straight north / west / east / south of the spawn point,
// so every path is either a vertical or a horizontal strip.
export const PATH_WIDTH = 110
export function pathTo(place) {
  const vertical = place.x === SPAWN.x
  return {
    left: vertical ? SPAWN.x - PATH_WIDTH / 2 : Math.min(SPAWN.x, place.x),
    top: vertical ? Math.min(SPAWN.y, place.y) : SPAWN.y - PATH_WIDTH / 2,
    width: vertical ? PATH_WIDTH : Math.abs(SPAWN.x - place.x),
    height: vertical ? Math.abs(SPAWN.y - place.y) : PATH_WIDTH,
  }
}

// Is the point (x, y) inside the oval of place p?
// Oval formula: (dx / rx)² + (dy / ry)² < 1
export function isOnPlace(p, x, y) {
  const dx = (x - p.x) / PLACE_SIZE.rx
  const dy = (y - p.y) / PLACE_SIZE.ry
  return dx * dx + dy * dy < 1
}

// the place you are standing on, or null
export function placeAt(x, y) {
  return places.find((p) => isOnPlace(p, x, y)) || null
}

// where you land when you jump to a place from the top bar
export function placeSpawn(id) {
  const place = places.find((p) => p.id === id) || places[0]
  return { x: place.x, y: place.y }
}

// Every movie goes to one of the 3 movie places (same rule as before):
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

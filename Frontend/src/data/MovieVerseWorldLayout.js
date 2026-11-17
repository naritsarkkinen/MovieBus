// Layout of the MovieVerse hub, in world pixels.
export const WORLD = { width: 1600, height: 1200 }

// you start in the middle of the hub
export const SPAWN = { x: 800, y: 640 }

// the 4 places around the hub (x, y = middle of the place)
export const places = [
  { id: 'trending', x: 420, y: 420 },
  { id: 'discover', x: 800, y: 260 },
  { id: 'community', x: 1180, y: 420 },
  { id: 'clubs', x: 800, y: 960 },
]

// how close (in pixels) you must be to stand "on" a place
export const PLACE_RADIUS = 90

// booths in the "Clubs + you" place
export const clubSpots = {
  studio: { x: 600, y: 1060 },
  room: { x: 1000, y: 1060 },
  shelf: { x: 620, y: 880 },
  board: { x: 980, y: 880 },
}

// the welcome sign floats above the spawn point
export const SIGN = { x: 800, y: 560 }

export const friendSpots = [
  { x: 560, y: 700 },
  { x: 1040, y: 700 },
  { x: 700, y: 780 },
]

// where friends go after you invite them to Friday Film Club
export const roomFriendSpots = [
  { x: 1130, y: 1110 },
  { x: 1190, y: 1050 },
  { x: 1080, y: 1150 },
]

// the place you are standing on, or null
export function placeAt(x, y) {
  return places.find((p) => Math.hypot(x - p.x, y - p.y) < PLACE_RADIUS) || null
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

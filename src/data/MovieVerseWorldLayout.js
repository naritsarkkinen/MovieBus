// Layout of the walkable MovieVerse world, in world pixels.
export const WORLD = { width: 2400, height: 1500 }

export const SPAWN = { x: 1200, y: 1260 }

export const districts = [
  { id: 'trending', x: 80, y: 80, w: 720, h: 640 },
  { id: 'discover', x: 840, y: 80, w: 720, h: 640 },
  { id: 'community', x: 1600, y: 80, w: 720, h: 640 },
]

export const lobby = { x: 420, y: 780, w: 1560, h: 660 }

// Spots in the lobby you can walk up to.
export const lobbySpots = {
  sign: { x: 1200, y: 960 },
  studio: { x: 760, y: 1200 },
  room: { x: 1640, y: 1200 },
  shelf: { x: 600, y: 960 },
  board: { x: 1800, y: 960 },
}

export const friendSpots = [
  { x: 330, y: 670 },
  { x: 980, y: 1110 },
  { x: 1340, y: 650 },
]

// where friends go after you invite them to Friday Film Club
export const roomFriendSpots = [
  { x: 1520, y: 1300 },
  { x: 1760, y: 1300 },
  { x: 1640, y: 1350 },
]

export function districtAt(x, y) {
  return districts.find(
    (d) => x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h,
  )
}

export function districtSpawn(id) {
  const d = districts.find((item) => item.id === id) || districts[0]
  return { x: d.x + d.w / 2, y: d.y + d.h - 80 }
}

// Every movie gets exactly one stand: the best rated go to Community,
// the first of the rest to Trending, everything else to Discover.
export function placeMovies(movies) {
  const perDistrict = Math.max(1, Math.ceil(movies.length / 3))
  const community = [...movies]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, perDistrict)
  const rest = movies.filter((m) => !community.includes(m))
  const groups = {
    trending: rest.slice(0, perDistrict),
    discover: rest.slice(perDistrict),
    community,
  }

  return districts.flatMap((d) =>
    groups[d.id].map((movie, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      return {
        movie,
        district: d.id,
        x: d.x + 180 + col * 180,
        y: d.y + 400 + row * 190 - (col === 1 ? 70 : 0),
      }
    }),
  )
}

import { describe, expect, it } from 'vitest'
import {
  maps,
  pathTo,
  placeAt,
  placeSpawn,
  splitMovies,
} from '../../src/data/MovieVerseWorldLayout.js'
import { clampIndex } from '../../src/utils/clampIndex.js'

const movie = (id, rating) => ({ id, rating })

describe('splitMovies', () => {
  it('puts every movie in exactly one place, best rated in community', () => {
    const movies = [movie(1, 5), movie(2, 9), movie(3, 7), movie(4, null)]
    const groups = splitMovies(movies)
    expect(groups.community.map((m) => m.id)).toEqual([2, 3])
    expect(groups.trending.map((m) => m.id)).toEqual([1, 4])
    expect(groups.discover).toEqual([])
  })

  it('works with no movies', () => {
    expect(splitMovies([])).toEqual({
      trending: [],
      discover: [],
      community: [],
    })
  })
})

describe('placeAt', () => {
  it('finds the place you stand on, or null in the middle of the hub', () => {
    expect(placeAt(maps.hub, 1400, 390).id).toBe('discover')
    expect(placeAt(maps.hub, 1400, 1000)).toBeNull()
  })

  it('uses the oval shape: wide to the sides, narrow up and down', () => {
    expect(placeAt(maps.hub, 1400 + 160, 380).id).toBe('discover') // 160 px to the side: on it
    expect(placeAt(maps.hub, 1400, 380 + 95)).toBeNull() // 95 px down: off it
  })

  it('looks only at the places of the given map', () => {
    expect(placeAt(maps.clubs, 480, 420).id).toBe('watchlist')
    expect(placeAt(maps.hub, 480, 420)).toBeNull()
  })

  it('nobody arrives standing on a place (that would open it at once)', () => {
    expect(placeAt(maps.hub, maps.hub.spawn.x, maps.hub.spawn.y)).toBeNull()
    expect(
      placeAt(maps.hub, maps.hub.returnSpawn.x, maps.hub.returnSpawn.y),
    ).toBeNull()
    expect(
      placeAt(maps.clubs, maps.clubs.spawn.x, maps.clubs.spawn.y),
    ).toBeNull()
  })
})

describe('placeSpawn', () => {
  it('returns the middle of a place, or null if the map does not have it', () => {
    expect(placeSpawn(maps.hub, 'clubs')).toEqual({ x: 1400, y: 1620 })
    expect(placeSpawn(maps.clubs, 'trending')).toBeNull()
  })
})

describe('pathTo', () => {
  it('makes a vertical strip to a place straight north', () => {
    const discover = { id: 'discover', x: 1400, y: 380 }
    expect(pathTo(maps.hub, discover)).toEqual({
      left: 1400 - 55,
      top: 380,
      width: 110,
      height: 1000 - 380,
    })
  })

  it('makes a horizontal strip to a place straight west', () => {
    const trending = { id: 'trending', x: 760, y: 1000 }
    expect(pathTo(maps.hub, trending)).toEqual({
      left: 760,
      top: 1000 - 55,
      width: 1400 - 760,
      height: 110,
    })
  })
})

describe('clampIndex', () => {
  it('keeps the index inside the list', () => {
    expect(clampIndex(-1, 5)).toBe(0)
    expect(clampIndex(7, 5)).toBe(4)
    expect(clampIndex(2, 5)).toBe(2)
  })
})

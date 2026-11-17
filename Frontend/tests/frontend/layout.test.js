import { describe, expect, it } from 'vitest'
import {
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
  it('finds the place you stand on, or null in the hub', () => {
    expect(placeAt(800, 270).id).toBe('discover')
    expect(placeAt(800, 640)).toBeNull()
  })

  it('uses the oval shape: wide to the sides, narrow up and down', () => {
    expect(placeAt(800 + 120, 260).id).toBe('discover') // 120 px to the side: on it
    expect(placeAt(800, 260 + 80)).toBeNull() // 80 px down: off it
  })

  it('placeSpawn returns the middle of the place', () => {
    expect(placeSpawn('clubs')).toEqual({ x: 800, y: 960 })
  })
})

describe('clampIndex', () => {
  it('keeps the index inside the list', () => {
    expect(clampIndex(-1, 5)).toBe(0)
    expect(clampIndex(7, 5)).toBe(4)
    expect(clampIndex(2, 5)).toBe(2)
  })
})

import { describe, expect, it } from 'vitest'
import { nextGenre } from '../../src/utils/catalogueNav.js'

// 7 rows: 0 = All movies, then 1 2 / 3 4 / 5 6
describe('nextGenre', () => {
  it('goes down from All movies to the first genre', () => {
    expect(nextGenre(0, 'down', 2, 7)).toBe(1)
  })

  it('goes down one line (2 genres per line)', () => {
    expect(nextGenre(2, 'down', 2, 7)).toBe(4)
  })

  it('goes up from the first line back to All movies', () => {
    expect(nextGenre(2, 'up', 2, 7)).toBe(0)
  })

  it('goes left and right one genre', () => {
    expect(nextGenre(3, 'left', 2, 7)).toBe(2)
    expect(nextGenre(3, 'right', 2, 7)).toBe(4)
  })

  it('stays inside the list', () => {
    expect(nextGenre(6, 'down', 2, 7)).toBe(6)
    expect(nextGenre(0, 'left', 2, 7)).toBe(0)
  })

  it('moves one at a time on a phone (1 genre per line)', () => {
    expect(nextGenre(3, 'down', 1, 7)).toBe(4)
    expect(nextGenre(1, 'up', 1, 7)).toBe(0)
  })
})

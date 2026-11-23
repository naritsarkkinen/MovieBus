import { describe, expect, it } from 'vitest'
import { genreRows, movieGenres } from '../../src/data/MovieVerseGenres.js'

describe('movieGenres', () => {
  it('splits the genre list from the database', () => {
    expect(movieGenres({ genre: 'Adventure, Action, Fantasy' })).toEqual([
      'Adventure',
      'Action',
      'Fantasy',
    ])
  })

  it('uses one name for Sci-Fi and Science Fiction', () => {
    expect(movieGenres({ genre: 'Sci-Fi' })).toEqual(['Science Fiction'])
  })
})

describe('genreRows', () => {
  const odyssey = { id: 1, genre: 'Adventure, Action' }
  const getOut = { id: 2, genre: 'Horror' }
  const godzilla = { id: 3, genre: 'Action, Horror' }

  it('puts a movie in every genre it has', () => {
    const rows = genreRows([odyssey, getOut, godzilla])
    const action = rows.find((r) => r.genre === 'Action')
    expect(action.movies).toEqual([odyssey, godzilla])
  })

  it('shows the biggest genre first', () => {
    const rows = genreRows([odyssey, getOut, godzilla])
    expect(rows.map((r) => r.genre)).toEqual(['Action', 'Horror', 'Adventure'])
  })
})

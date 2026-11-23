import { describe, expect, it } from 'vitest'
import {
  genreRows,
  movieGenres,
  movieHasGenre,
} from '../../src/data/MovieVerseGenres.js'

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

describe('movieHasGenre', () => {
  it('finds a genre anywhere in the list', () => {
    const movie = { genre: 'Adventure, Action' }
    expect(movieHasGenre(movie, 'Action')).toBe(true)
    expect(movieHasGenre(movie, 'Horror')).toBe(false)
  })

  it('matches the Sci-Fi button with Science Fiction movies', () => {
    expect(movieHasGenre({ genre: 'Drama, Science Fiction' }, 'Sci-Fi')).toBe(true)
  })

  it('does not match part of a genre name', () => {
    expect(movieHasGenre({ genre: 'Romantic Comedy' }, 'Comedy')).toBe(false)
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

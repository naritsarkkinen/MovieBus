import { describe, expect, it } from 'vitest'
import { clubCards, movieCard } from '../../src/data/MovieVerseCards.js'

describe('movieCard', () => {
  it('turns a movie into a card and keeps the movie for opening it', () => {
    const movie = {
      id: 7,
      title: 'Inception',
      year: 2010,
      genre: 'Sci-Fi',
      rating: 4.5,
      color: 'violet',
      emoji: '🌀',
      poster: null,
    }
    expect(movieCard(movie)).toEqual({
      id: 7,
      title: 'Inception',
      sub: '2010 · Sci-Fi · ★ 4.5',
      color: 'violet',
      emoji: '🌀',
      poster: null,
      movie,
    })
  })
})

describe('clubCards', () => {
  it('has the 4 choices of Clubs & you', () => {
    const ids = clubCards({ joined: false, watchlistCount: 0 }).map((c) => c.id)
    expect(ids).toEqual(['watchlist', 'communities', 'studio', 'room'])
  })

  it('shows the watchlist count and whether you are in the room', () => {
    const [watchlist, , , room] = clubCards({ joined: true, watchlistCount: 3 })
    expect(watchlist.sub).toBe('3 saved')
    expect(room.sub).toBe('You are inside · leave')
  })
})

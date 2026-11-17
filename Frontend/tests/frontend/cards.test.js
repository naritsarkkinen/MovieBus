import { describe, expect, it } from 'vitest'
import { communityCard, movieCard } from '../../src/data/MovieVerseCards.js'

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

describe('communityCard', () => {
  const club = { id: 2, name: 'Sci-Fi Explorers', members: 5 }

  it('shows the member count and "Join" when you are not a member', () => {
    const card = communityCard(club, false)
    expect(card).toMatchObject({
      id: 2,
      title: 'Sci-Fi Explorers',
      sub: '5 members · Join',
    })
    expect(card.community).toBe(club)
  })

  it('counts you and shows "Leave" when you are a member', () => {
    expect(communityCard(club, true).sub).toBe('6 members · Leave')
  })
})

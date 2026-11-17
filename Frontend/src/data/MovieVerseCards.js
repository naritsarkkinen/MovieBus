import { formatRating } from '../api/movies'

// A "card" is what the card stack shows. Movies and the Clubs & you choices
// get the same shape, so one card stack component can show both:
// { id, title, sub, color, emoji, poster, movie }

// one movie as a card (card.movie is the movie itself, for opening it)
export function movieCard(movie) {
  return {
    id: movie.id,
    title: movie.title,
    sub: `${movie.year} · ${movie.genre} · ★ ${formatRating(movie.rating)}`,
    color: movie.color,
    emoji: movie.emoji,
    poster: movie.poster,
    movie,
  }
}

// the 4 choices of the Clubs & you place
export function clubCards({ joined, watchlistCount }) {
  return [
    {
      id: 'watchlist',
      title: 'Watchlist',
      sub: watchlistCount + ' saved',
      color: 'rose',
      emoji: '♥',
    },
    {
      id: 'communities',
      title: 'Communities',
      sub: 'Find your people',
      color: 'blue',
      emoji: '☰',
    },
    {
      id: 'studio',
      title: 'Avatar studio',
      sub: 'Change your look',
      color: 'violet',
      emoji: '✦',
    },
    {
      id: 'room',
      title: 'Friday Film Club',
      sub: joined ? 'You are inside · leave' : 'Friend room · join',
      color: 'pink',
      emoji: '◎',
    },
  ]
}

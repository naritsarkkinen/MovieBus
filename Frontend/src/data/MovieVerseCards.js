import { formatRating } from '../api/movies'

// same card shape for movies & communities → one CardStack shows both

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

export function communityCard(community, member) {
  const members = community.members + (member ? 1 : 0)
  return {
    id: community.id,
    title: community.name,
    sub: `${members} members · ${member ? 'Leave' : 'Join'}`,
    color: member ? 'green' : 'blue',
    emoji: member ? '✓' : '☰',
    community,
  }
}

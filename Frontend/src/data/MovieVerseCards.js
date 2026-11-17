import { formatRating } from '../api/movies'

// A "card" is what the card stack shows. Movies and communities get the
// same shape, so one card stack component can show both:
// { id, title, sub, color, emoji, poster, movie / community }

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

// one community as a card (card.community is the community itself)
// member = are you in it (then joining adds you to the member count)
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

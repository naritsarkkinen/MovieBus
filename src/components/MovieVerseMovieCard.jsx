import { Star } from 'lucide-react'

export default function MovieVerseMovieCard({ movie, onSelect }) {
  return (
    <button className="catalog-card" onClick={() => onSelect(movie)}>
      <div className={'catalog-art poster-' + movie.color}>
        <span>{movie.emoji}</span>
        <small>{movie.tag}</small>
      </div>

      <div className="catalog-info">
        <b>{movie.title}</b>
        <small>
          {movie.year} · {movie.genre}
        </small>
        <span>
          <Star size={12} fill="currentColor" />
          {movie.rating} <i>· {movie.votes} ratings</i>
        </span>
      </div>
    </button>
  )
}

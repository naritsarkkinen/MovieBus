import { Star } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { formatRating } from '../api/movies'

export default function MovieVerseMovieCard({ movie, onSelect }) {
  return (
    <button className="catalog-card" onClick={() => onSelect(movie)}>
      <div className={'catalog-art poster-' + movie.color}>
        <MoviePosterImage src={movie.poster} title={movie.title} />
        <span className="art-emoji">{movie.emoji}</span>
        <small>{movie.tag}</small>
      </div>

      <div className="catalog-info">
        <b>{movie.title}</b>
        <small>
          {movie.year} · {movie.genre}
        </small>
        <span>
          <Star size={12} fill="currentColor" />
          {formatRating(movie.rating)} <i>· {movie.votes} ratings</i>
        </span>
      </div>
    </button>
  )
}

import { Heart, MessageCircle, Star, X } from 'lucide-react'
import MoviePosterImage from './MoviePosterImage'
import { formatRating } from '../api/movies'

export default function MovieVerseMovieModal({
  movie,
  myRating,
  inWatchlist,
  review,
  onReviewChange,
  onRate,
  onToggleWatchlist,
  onSaveReview,
  ratingPending,
  reviewPending,
  reviews = [],
  onClose,
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className={'modal-art poster-' + movie.color}>
          <MoviePosterImage src={movie.poster} title={movie.title} />
          <span className="art-emoji">{movie.emoji}</span>
          <small>{movie.tag}</small>
        </div>
        <div className="modal-content">
          <div className="eyebrow">
            MOVIE DETAIL · {movie.genre.toUpperCase()}
          </div>
          <h2>{movie.title}</h2>
          <p className="modal-meta">
            {movie.year} <span>·</span> {movie.genre} <span>·</span>{' '}
            <Star size={14} fill="currentColor" /> {formatRating(movie.rating)}{' '}
            <small>({movie.votes})</small>
          </p>
          <p className="movie-desc">{movie.desc}</p>
          <button
            className={'watchlist-button' + (inWatchlist ? ' saved' : '')}
            onClick={onToggleWatchlist}
          >
            <Heart size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
            {inWatchlist ? 'Saved to watchlist' : 'Save to watchlist'}
          </button>
          <div className="rate-block">
            <b>YOUR RATING</b>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => onRate(n)}
                  disabled={ratingPending}
                  className={n <= (myRating || 0) ? 'rated' : ''}
                  aria-label={`Rate ${n} out of 5`}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
            <small>
              {myRating
                ? `You rated this ${myRating} / 5`
                : 'Tap a star to rate this movie'}
            </small>
          </div>
          <div className="review-block">
            <label htmlFor="mv-review">ADD TO THE CONVERSATION</label>
            <textarea
              id="mv-review"
              value={review}
              onChange={(e) => onReviewChange(e.target.value)}
              maxLength={1500}
              placeholder="What did you think of this movie?"
            />
            <button
              className="primary-button"
              onClick={onSaveReview}
              disabled={reviewPending || !review.trim()}
            >
              Post review <MessageCircle size={14} />
            </button>
          </div>
          <div className="mv-reviews">
            <b>COMMUNITY REVIEWS ({reviews.length})</b>
            {reviews.length === 0 && (
              <small>No reviews yet. Be the first one!</small>
            )}
            {reviews.map((r) => (
              <div className="mv-review" key={r.id}>
                <div>
                  <b>{r.author}</b>
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

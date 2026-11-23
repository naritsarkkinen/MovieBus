import MovieVersePanel from './MovieVersePanel'
import MovieVerseMovieGrid from './MovieVerseMovieGrid'
import { EMPTY_WATCHLIST } from '../data/MovieVersePlaces'

export default function MovieVerseWatchlist({ movies, onSelect, onClose }) {
  return (
    <MovieVersePanel
      eyebrow="YOUR WATCHLIST"
      title={`Saved movies (${movies.length})`}
      wide
      onClose={onClose}
    >
      <MovieVerseMovieGrid
        movies={movies}
        onSelect={onSelect}
        emptyText={EMPTY_WATCHLIST}
      />
    </MovieVersePanel>
  )
}

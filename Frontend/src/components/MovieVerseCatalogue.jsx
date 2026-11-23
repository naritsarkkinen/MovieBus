import MovieVersePanel from './MovieVersePanel'
import MovieVerseMovieGrid from './MovieVerseMovieGrid'

export default function MovieVerseCatalogue({ movies, apiFailed, onSelect, onClose }) {
  return (
    <MovieVersePanel
      eyebrow={`CATALOGUE · ${movies.length} MOVIES`}
      title="All movies"
      wide
      onClose={onClose}
    >
      <p className="mv-panel-sub">
        The same movies you can walk to in the world. Search and genre
        filters apply here too.
      </p>
      <MovieVerseMovieGrid
        movies={movies}
        onSelect={onSelect}
        emptyText={
          apiFailed
            ? 'Could not load movies from the API. Check that the backend is running.'
            : 'No movies found. Try another search or genre.'
        }
      />
    </MovieVersePanel>
  )
}

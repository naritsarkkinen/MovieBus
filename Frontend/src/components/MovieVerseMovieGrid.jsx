import MovieVerseMovieCard from './MovieVerseMovieCard'

// grid of movie cards, or a message when the list is empty
export default function MovieVerseMovieGrid({ movies, emptyText, onSelect }) {
  if (movies.length === 0) {
    return <div className="empty-state">{emptyText}</div>
  }
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieVerseMovieCard key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  )
}

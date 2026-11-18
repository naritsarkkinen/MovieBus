const genres = [
  'All',
  'Sci-Fi',
  'Action',
  'Animation',
  'Horror',
  'Comedy',
  'Romance',
]

export default function MovieVerseGenreFilter({ activeGenre, onSelect }) {
  return (
    <div className="genre-row">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(genre)}
          className={activeGenre === genre ? 'genre active-genre' : 'genre'}
        >
          {genre}
        </button>
      ))}
    </div>
  )
}

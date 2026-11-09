function MovieCard({ title, poster, year }) {
  return (
    <article className="movie-card">
      <img
        src={poster}
        alt={`${title} poster`}
        loading="lazy"
      />
      <h3 className="movie-card-title">{title}</h3>
      {year !== undefined && year !== null && <p>Year: {year}</p>}
    </article>
  )
}

export default MovieCard

function MovieCard({ title, poster }) {
  return (
    <article className="movie-card">
      <img
        src={poster}
        alt={`${title} poster`}
        loading="lazy"
      />
      <h3 className="movie-card-title">{title}</h3>
    </article>
  )
}

export default MovieCard

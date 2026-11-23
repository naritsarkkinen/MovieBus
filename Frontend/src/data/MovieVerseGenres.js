// DB genre is a list: "Adventure, Action, Fantasy" → ['Adventure', 'Action', 'Fantasy']
// "Sci-Fi" and "Science Fiction" are the same genre → use one name
export function movieGenres(movie) {
  return movie.genre
    .split(',')
    .map((g) => g.trim())
    .filter((g) => g !== '')
    .map((g) => (g === 'Sci-Fi' ? 'Science Fiction' : g))
}

// one row per genre, a movie goes to EVERY genre it has
// biggest genre first, same size → A to Z
export function genreRows(movies) {
  const rows = {}
  for (const movie of movies) {
    for (const genre of movieGenres(movie)) {
      if (!rows[genre]) rows[genre] = []
      rows[genre].push(movie)
    }
  }
  return Object.keys(rows)
    .map((genre) => ({ genre, movies: rows[genre] }))
    .sort(
      (a, b) =>
        b.movies.length - a.movies.length || a.genre.localeCompare(b.genre),
    )
}

const movies = [
  { id: 1, title: 'Inception', year: 2010 , image: '/posters/Inception.jpg'},
  { id: 2, title: 'Interstellar', year: 2014, image: '/posters/interstellar.jpg'},
  { id: 3, title: 'The Dark Knight', year: 2008, image: '/posters/the dark knight.jpg'},
]
function Home() {
  return (
    <div>
      <h1>Welcome to the MovieBus</h1>
      <h2>Movies</h2>
      <div className="movie-list">
        {movies.map(movie => (
          <div className="movie-card" key={movie.id}>
            <img src={movie.image} alt={movie.title} />
            <h3>{movie.title}</h3>
            <p>Year: {movie.year}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
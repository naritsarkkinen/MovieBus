import MovieCard from '../components/MovieCard'

const movies = [
  {
    id: 1,
    title: 'Inception',
    year: 2010,
    poster: '/posters/Inception.jpg',
  },
  {
    id: 2,
    title: 'Interstellar',
    year: 2014,
    poster: '/posters/interstellar.jpg',
  },
  {
    id: 3,
    title: 'The Dark Knight',
    year: 2008,
    poster: '/posters/the dark knight.jpg',
  },
]

// eslint-disable-next-line max-lines-per-function
function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="content-wrap">
          <h1>Movies are better together.</h1>
          <p>
            Find movies, share your thoughts, and build your own movie
            community.
          </p>

          {/* TODO: Connect search input to movie search functionality. */}
          <div className="search-container">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search for movies..."
              aria-label="Search for movies"
              className="search-input"
            />
          </div>
        </div>
      </section>

      <div className="page-content">
        <section className="clubs-section">
          <div className="section-heading">
            <h2>Your Clubs</h2>
            <span className="section-link">Explore clubs</span>
          </div>

          {/* DEMO DATA: Example clubs for UI development.
           Replace with the logged-in user's clubs later. */}
          <div className="clubs-grid">
            <article className="club-card">
              <span className="card-icon">♧</span>
              <h3>Movie Night Crew</h3>
              <p>Your friends' movie club</p>
            </article>

            {/* TODO: Link to club discovery page when implemented. */}
            <article className="club-card">
              <span className="card-icon">⊕</span>
              <h3>Discover Clubs</h3>
              <p>Meet other movie fans</p>
            </article>
          </div>
        </section>

        <section className="community-section">
          <h2>Community Activity</h2>

          {/* DEMO DATA: Example community activity.
              Replace with real user and club activity later. */}
          <div className="activity-list">
            <div className="activity-item">
              <span className="card-icon">☆</span>
              <p>A friend rated Interstellar 5/5</p>
            </div>

            <div className="activity-item">
              <span className="card-icon">☷</span>
              <p>Movie Night Crew updated its watchlist</p>
            </div>
          </div>
        </section>

        <section className="trending-section">
          <h2>Movies</h2>

          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                poster={movie.poster}
                year={movie.year}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home

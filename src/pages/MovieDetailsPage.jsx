import './MovieDetailsPage.css'
import { useParams } from 'react-router'

function MovieDetailsPage() {
  const { id } = useParams()

  const movies = {
    1: {
      title: 'The Dark Knight',
      year: 2008,
      rating: 9.0,
      runtime: '2h 32m',
      genres: ['Action', 'Crime', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      description:
        'Batman must confront the Joker, a criminal mastermind who brings chaos to Gotham City and challenges everything Batman stands for.',
    },

    2: {
      title: 'Inception',
      year: 2010,
      rating: 8.8,
      runtime: '2h 28m',
      genres: ['Sci-Fi', 'Action', 'Thriller'],
      poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      description:
        'A professional thief who steals information by entering dreams receives a final mission that could restore his old life.',
    },

    3: {
      title: 'Interstellar',
      year: 2014,
      rating: 8.7,
      runtime: '2h 49m',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      description:
        'A team of explorers travel through a wormhole in space in search of a new home for humanity as Earth faces extinction.',
    },
  }

  const movie = movies[id]

  if (!movie) {
    return <h1>Movie not found</h1>
  }

  return (
    <div className="details-container">
      <div className="hero">
        <div className="poster-section">
          <img src={movie.poster} alt={movie.title} className="big-poster" />
        </div>

        <div className="info-section">
          <h1>{movie.title}</h1>

          <div className="movie-meta">
            {movie.year} • {movie.runtime}
          </div>

          <div className="genres">
            {movie.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>

          <div className="rating-box">★ {movie.rating}/10</div>

          <p className="description">{movie.description}</p>

          <div className="action-buttons">
            <button>Add To Watchlist</button>
            <button>Write Review</button>
            <button>Share</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Community Reviews</h2>

        <div className="review-card">
          <strong>★★★★★</strong>
          <p>
            Incredible performance and storytelling. One of the best films ever
            made.
          </p>
        </div>

        <div className="review-card">
          <strong>★★★★☆</strong>
          <p>Excellent atmosphere, characters and pacing.</p>
        </div>
      </div>

      <div className="section">
        <h2>Similar Movies</h2>

        <div className="similar-movies">
          <div className="similar-card">
            <img src="https://picsum.photos/150/220?1" alt="" />
            <p>Joker</p>
          </div>

          <div className="similar-card">
            <img src="https://picsum.photos/150/220?2" alt="" />
            <p>Inception</p>
          </div>

          <div className="similar-card">
            <img src="https://picsum.photos/150/220?3" alt="" />
            <p>The Batman</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailsPage

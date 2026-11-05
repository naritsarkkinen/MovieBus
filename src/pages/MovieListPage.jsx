import "../App.css";
import { Link } from "react-router-dom";

function MovieListPage() {
    const topRated = [
        {
            id: 1,
            title: "The Dark Knight",
            year: 2008,
            genre: "Action",
            rating: 9.0,
            description:
                "Batman must confront the Joker, a criminal mastermind who brings chaos to Gotham City and pushes Batman to his limits through a series of deadly challenges.",
            poster:
                "https://image.tmdb.org/t/p/w200/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        },
        {
            id: 2,
            title: "Inception",
            year: 2010,
            genre: "Sci-Fi",
            rating: 8.8,
            description:
                "A professional thief who steals information by entering dreams receives a final mission that could restore his old life.",
            poster:
                "https://image.tmdb.org/t/p/w200/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        },
        {
            id: 3,
            title: "Interstellar",
            year: 2014,
            genre: "Sci-Fi",
            rating: 8.7,
            description:
                "A team of explorers travel through a wormhole in space in search of a new home for humanity as Earth faces extinction.",
            poster:
                "https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        },
    ];

    const trending = [
        { title: "Dune Part Two", poster: "https://picsum.photos/50/75?11" },
        { title: "Oppenheimer", poster: "https://picsum.photos/50/75?12" },
        { title: "Joker", poster: "https://picsum.photos/50/75?13" },
        { title: "The Batman", poster: "https://picsum.photos/50/75?14" },
        { title: "Deadpool", poster: "https://picsum.photos/50/75?15" },
    ];

    const communityPicks = [
        { title: "Fight Club", poster: "https://picsum.photos/50/75?21" },
        { title: "The Matrix", poster: "https://picsum.photos/50/75?22" },
        { title: "Gladiator", poster: "https://picsum.photos/50/75?23" },
        { title: "Whiplash", poster: "https://picsum.photos/50/75?24" },
        { title: "The Prestige", poster: "https://picsum.photos/50/75?25" },
    ];

    return (
        <div className="container">
            <h1>MovieBus</h1>

            <p className="subtitle">
                Discover, review and share movies with friends.
            </p>

            <input
                className="search"
                placeholder="Search movies..."
            />

            <div className="layout">

                <div className="main-content">

                    <div className="section-header">
                        <h2>Top Rated Movies</h2>
                        <span>Top 250 Community Rankings</span>
                    </div>

                    {topRated.map((movie) => (
                        <div className="movie-row" key={movie.id}>
                            <img
                                className="poster"
                                src={movie.poster}
                                alt={movie.title}
                            />

                            <div className="movie-info">

                                <h3>{movie.title}</h3>

                                <p className="meta">
                                    {movie.year} • {movie.genre}
                                </p>

                                <p className="description">
                                    {movie.description}
                                </p>

                                <div className="movie-bottom">

                                    <div className="rating">
                                        ★ {movie.rating}
                                    </div>

                                    <div className="movie-actions">
                                        <button>Watchlist</button>

                                        <Link to={`/movie/${movie.id}`}>
                                            <button>Details</button>
                                        </Link>

                                        <button>Review</button>
                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>

                <div className="sidebar">

                    <h2>Trending Now</h2>

                    {trending.map((movie, index) => (
                        <div className="mini-movie" key={index}>
                            <img
                                src={movie.poster}
                                alt={movie.title}
                            />

                            <span>{movie.title}</span>
                        </div>
                    ))}

                    <h2 className="section-title">
                        Community Picks
                    </h2>

                    {communityPicks.map((movie, index) => (
                        <div className="mini-movie" key={index}>
                            <img
                                src={movie.poster}
                                alt={movie.title}
                            />

                            <span>{movie.title}</span>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}

export default MovieListPage;
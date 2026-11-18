
const { Pool } = require("pg");

// ==========================================
// MOVIEBUS - TMDB IMPORT
// ==========================================

// Tokenit ympäristömuuttujista
const token = process.env.TMDB_READ_TOKEN;
const password = process.env.MOVIEBUS_DB_PASSWORD;

// Elokuvamäärä komentoriviltä, oletuksena 50
const requestedLimit = process.argv[2] ?? "50";
const MOVIE_LIMIT = Number(requestedLimit);

if (
  !Number.isSafeInteger(MOVIE_LIMIT) ||
  MOVIE_LIMIT < 1 ||
  MOVIE_LIMIT > 10000
) {
  console.error("Anna elokuvamäärä väliltä 1–10000.");
  process.exit(1);
}

if (!token || !password) {
  console.error(
    "TMDB token tai Azure PostgreSQL salasana puuttuu."
  );
  process.exit(1);
}

// Azure PostgreSQL
const pool = new Pool({
  host: "moviebus-db-neu.postgres.database.azure.com",
  port: 5432,
  database: "MovieBus",
  user: "appadmin",
  password,
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 30000,
});

// ==========================================
// TMDB API
// ==========================================

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(
    `https://api.themoviedb.org/3${endpoint}`
  );

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ==========================================
// MAIN IMPORT
// ==========================================

async function importMovies() {
  // 1. Varmistetaan oikea tietokanta
  const check = await pool.query(
    "SELECT current_database() AS database"
  );

  if (check.rows[0].database !== "MovieBus") {
    throw new Error(
      "Väärä tietokanta! Tuonti keskeytetty."
    );
  }

  console.log("Azure PostgreSQL yhdistetty.");

  // 2. Haetaan TMDB:n genret
  const genreData = await fetchTMDB(
    "/genre/movie/list",
    { language: "en-US" }
  );

  if (!Array.isArray(genreData.genres)) {
    throw new Error("TMDB-genret puuttuvat.");
  }

  const genreMap = new Map(
    genreData.genres.map((genre) => [
      genre.id,
      genre.name,
    ])
  );

  console.log(
    `Ladattu ${genreMap.size} genreä.`
  );

  // 3. Haetaan haluttu määrä elokuvia
  const movies = [];
  const seenIds = new Set();

  let page = 1;

  while (movies.length < MOVIE_LIMIT) {
    console.log(`Haetaan TMDB sivu ${page}...`);

    const data = await fetchTMDB(
      "/movie/popular",
      {
        language: "en-US",
        page,
      }
    );

    if (!Array.isArray(data.results)) {
      throw new Error(
        "TMDB palautti odottamattoman vastauksen."
      );
    }

    if (data.results.length === 0) {
      break;
    }

    for (const movie of data.results) {
      if (!movie.id || !movie.title) continue;
      if (seenIds.has(movie.id)) continue;

      seenIds.add(movie.id);
      movies.push(movie);

      if (movies.length >= MOVIE_LIMIT) {
        break;
      }
    }

    if (page >= data.total_pages) {
      break;
    }

    page++;
  }

  console.log(
    `TMDB:stä haettu ${movies.length} elokuvaa.`
  );

  // 4. Tallennetaan PostgreSQL:ään
  let imported = 0;

  for (const movie of movies) {
    // Julkaisuvuosi
    const year = /^\d{4}/.test(
      movie.release_date || ""
    )
      ? Number(movie.release_date.slice(0, 4))
      : null;

    // Genre-ID:t -> oikeat nimet
    const genres = (movie.genre_ids || [])
      .map((id) => genreMap.get(id))
      .filter(Boolean)
      .join(", ");

    await pool.query(
      `
      INSERT INTO public.movies (
        tmdb_id,
        title,
        release_year,
        genre,
        description,
        poster_path,
        backdrop_path,
        tmdb_rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

      ON CONFLICT (tmdb_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        release_year = EXCLUDED.release_year,
        genre = EXCLUDED.genre,
        description = EXCLUDED.description,
        poster_path = EXCLUDED.poster_path,
        backdrop_path = EXCLUDED.backdrop_path,
        tmdb_rating = EXCLUDED.tmdb_rating
      `,
      [
        movie.id,
        movie.title.slice(0, 100),
        year,
        genres || null,
        movie.overview || null,
        movie.poster_path || null,
        movie.backdrop_path || null,
        movie.vote_average ?? null,
      ]
    );

    imported++;

    console.log(
      `${imported}/${movies.length} - ${movie.title} | ${genres || "Genre unknown"}`
    );
  }

  console.log(
    `Valmis! Käsitelty ${imported} elokuvaa.`
  );
}

// ==========================================
// START
// ==========================================

importMovies()
  .catch((error) => {
    console.error(
      "Tuonti epäonnistui:",
      error.message
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

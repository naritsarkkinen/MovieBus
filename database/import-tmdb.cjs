
const { Pool } = require("pg");

const token = process.env.TMDB_READ_TOKEN;
const password = process.env.MOVIEBUS_DB_PASSWORD;

if (!token || !password) {
  console.error("TMDB token tai tietokannan salasana puuttuu.");
  process.exit(1);
}

const pool = new Pool({
  host: "moviebus-db-neu.postgres.database.azure.com",
  port: 5432,
  database: "MovieBus",
  user: "appadmin",
  password,
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 10000,
});

async function importMovies() {
  // Tarkistetaan yhteys oikeaan tietokantaan.
  const check = await pool.query(
    "SELECT current_database() AS database"
  );

  if (check.rows[0].database !== "MovieBus") {
    throw new Error("Väärä tietokanta. Tuonti keskeytetty.");
  }

  console.log("Yhdistetty Azure PostgreSQL:ään.");

  // Haetaan TMDB:n suosittuja elokuvia.
  const response = await fetch(
    "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`TMDB API -virhe: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("TMDB palautti odottamattoman vastauksen.");
  }

  let imported = 0;

  for (const movie of data.results) {
    if (!movie.id || !movie.title) continue;

    const year = /^\d{4}/.test(movie.release_date || "")
      ? Number(movie.release_date.slice(0, 4))
      : null;

    await pool.query(
      `
      INSERT INTO public.movies
        (tmdb_id, title, release_year, description,
         poster_path, backdrop_path, tmdb_rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tmdb_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        release_year = EXCLUDED.release_year,
        description = EXCLUDED.description,
        poster_path = EXCLUDED.poster_path,
        backdrop_path = EXCLUDED.backdrop_path,
        tmdb_rating = EXCLUDED.tmdb_rating
      `,
      [
        movie.id,
        movie.title.slice(0, 100),
        year,
        movie.overview || null,
        movie.poster_path || null,
        movie.backdrop_path || null,
        movie.vote_average ?? null,
      ]
    );

    console.log(`Tallennettu: ${movie.title}`);
    imported++;
  }

  console.log(`Valmis! Käsitelty ${imported} elokuvaa.`);
}

importMovies()
  .catch((error) => {
    console.error("Tuonti epäonnistui:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

# MovieVerse frontend

React + Vite frontend for MovieBus. The page is a small 2D hub you walk
around in. Four glowing places surround it: Trending, Discover and Community
open a stack of movie cards you can scroll through (like the phone app
switcher), and "Clubs & you" has the booths for communities, the friend room,
your watchlist and your avatar.

The backend (Express + PostgreSQL) is in the `Backend/` folder next to this one.

## Run it

```bash
cd Frontend
npm install
npm run dev
```

Open http://localhost:5173. Start the backend too (`cd Backend`, `npm start`):
Vite forwards every `/api` request to it on port 4000 (see `vite.config.js`).

If the backend is not running, the page shows sample movies and says
"sample mode" when you save something.

## Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | start the dev server            |
| `npm run build` | build the site into `dist/`     |
| `npm test`      | run the frontend tests (Vitest) |
| `npm run lint`  | check the code style (ESLint)   |

## Folders

```text
src/
  main.jsx            starts React
  App.jsx             shows the MovieVerse page
  index.css           global styles (fonts, colours, resets)
  pages/
    MovieVersePage.jsx   the page: state and overlays
    MovieVersePage.css   all styles for the page
  components/         parts of the page (world, top bar, popups...)
  api/                calls to the backend API
  hooks/
    useMovieVerseApi.js  saving and loading data for the page
  utils/              small helper functions
  data/               sample movies, friends and the world layout
tests/frontend/       tests for the api/ code and the hub layout
(project docs are in ../docs)
```

## API used

| Method | Path                        | Used for                                  |
| ------ | --------------------------- | ----------------------------------------- |
| GET    | `/api/movies`               | movies in the world                       |
| GET    | `/api/movies/:id`           | refresh one movie after rating            |
| GET    | `/api/movies/:id/reviews`   | reviews in the movie popup                |
| POST   | `/api/movies/:id/ratings`   | save a star rating                        |
| POST   | `/api/movies/:id/reviews`   | save a review                             |
| POST   | `/api/users`                | create a guest user                       |
| PATCH  | `/api/users/:id/avatar`     | save name, avatar, skin                   |

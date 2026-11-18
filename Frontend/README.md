# MovieVerse frontend

React + Vite frontend for MovieBus, in "2.5D": flat 2D characters walk
around a space hub, and everything you browse is shown as 3D cards.

- **The hub** is the shared space where everyone spawns. Around it are 4
  dimension portals (Trending, Discover, Community, Clubs & you), each
  with its own animated look (plain CSS, no images).
- **Movie portals:** step in and the 3D "cover flow" cards of that
  dimension appear right away. Swipe through them and click to open a movie.
- **Clubs & you:** takes you into your own dimension, with your watchlist,
  communities, avatar studio and the Friday Film Club room, plus a portal
  back to the hub.
- You can walk through other people, so a crowd never blocks anyone.

The backend (Express + PostgreSQL) is in the `Backend/` folder next to this one.

## Run it

```bash
cd Frontend
npm install
npm run dev
```

Open http://localhost:5173. Start the backend too (`cd Backend`, `npm start`):
Vite forwards every `/api` request to it on port 4000 (see `vite.config.js`).

If the backend is not running, the top bar shows "Offline" and there are no
movies: the page has no sample data. Saving shows an error until the API is back.

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
  data/               zones, simulated friends and the world layout
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

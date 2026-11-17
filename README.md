# MovieVerse frontend

React + Vite frontend for MovieBus. The whole page is a small 2D world:
you walk around with your avatar, open movies, rate and review them and
join communities.

The backend (Express + PostgreSQL) is in `Backend/` on the `main` branch.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

If `VITE_API_URL` is empty or the backend is not running, the page uses
sample movies and nothing is saved to the database.

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
  data/               sample movies, friends and the world layout
tests/frontend/       tests for the api/ code
docs/                 project documentation
```

## API used

| Method | Path                        | Used for                                  |
| ------ | --------------------------- | ----------------------------------------- |
| GET    | `/api/movies`               | movies in the world                       |
| GET    | `/api/movies/:id/reviews`   | reviews in the movie popup                |
| POST   | `/api/movies/:id/ratings`   | save a star rating                        |
| POST   | `/api/movies/:id/reviews`   | save a review                             |
| GET    | `/api/communities`          | communities list                          |
| POST   | `/api/communities/:id/join` | join a community (not in the backend yet) |
| POST   | `/api/users`                | create a guest user                       |
| PATCH  | `/api/users/:id/avatar`     | save name, avatar, skin                   |

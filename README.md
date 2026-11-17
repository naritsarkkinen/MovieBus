# MovieVerse — browser-based social movie world (MVP demo)

A deliberately low-end, 2D/2.5D browser demo for a four-person, five-week student project.
It is **not real VR**: movement is a lightweight CSS/React simulation. The demo works without
a backend using sample data. An Express + PostgreSQL starter API is included.

## Run the frontend

```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

## Run the API + PostgreSQL with Docker

From the project root:

```bash
docker compose up --build
```

API: http://localhost:4000/api/health
Frontend is still run separately with `cd client && npm install && npm run dev`.

To point the frontend at the API, create `client/.env`:
```
VITE_API_URL=http://localhost:4000/api
```
The demo currently uses local sample data for a reliable presentation; connect the API in
the integration week.

## Controls
- WASD / arrow keys: move your explorer around the lobby
- Search: filter movies
- Zone buttons: jump between the three discovery areas
- Click a movie: open details, rate it, and add a review
- Avatar: edit display name, skin, and avatar style
- Friends panel: invite/join a simulated friend session

## MVP scope (keep this scope!)
1. Login/register (or demo guest mode)
2. Profile + avatar customization
3. Three movie zones and searchable movie catalogue
4. Movie details, rating and reviews
5. Communities / friend rooms
6. Persist users, movies, ratings, reviews, memberships in PostgreSQL
7. Deploy frontend + API to Azure

Do not attempt voice chat, full 3D, real-time multiplayer physics, video streaming, or WebXR
in this five-week version. Presence can be simulated or implemented with Socket.IO only if
the core features are finished.

## Suggested API routes
- `GET /api/movies?search=&genre=`
- `GET /api/movies/:id`
- `POST /api/movies/:id/ratings`
- `GET /api/communities`
- `POST /api/communities`
- `GET /api/users/:id`
- `PATCH /api/users/:id/avatar`
- `POST /api/rooms/:id/join`

## Team delivery definition
A feature is done only when it works in the browser, has validation/error states, is tested by
another teammate, and is merged to the shared main branch.

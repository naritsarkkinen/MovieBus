# MovieVerse development

Run `npm install` in this folder. Set `DATABASE_URL` in the shell or in
`Backend/.env` to the connection string for your existing Azure PostgreSQL
database. Then run `npm start` here. The server listens on port 4000 by default,
and `http://localhost:4000/api/health` checks the database connection.

In a separate terminal, run `npm ci` and `npm run dev` from `Frontend`.
Vite forwards `/api` to port 4000 by default. If you change the backend
port locally, set `API_PROXY_TARGET` in the shell before running Vite.
For deployment, serve the API at the frontend's `/api` path or set
`VITE_API_URL` to the full API base, including `/api`, before building.
Set `CLIENT_ORIGIN` on the backend if the deployed frontend has a
different origin. Set `VITE_API_URL=` to run the frontend in sample mode.

The older test API and Docker Compose setup in `Frontend` are separate
from this Azure-backed workflow.

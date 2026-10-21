# Food Swap 🍅

Food Swap (working title) is a platform for swapping and giving away food, so it gets used instead of thrown away.

## Why Food Swap?

Every day, perfectly good food ends up in the bin. Food Swap connects people who have surplus food with people who can use it, whether that's next door or across the country.

## Features

- **Swap or give away**: offer food in exchange for something else, or just for free
- **Local search**: find offers near you
- **Nationwide search**: browse offers across the whole country
- **Messaging**: get in touch with other users to arrange the handover

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui, Zustand
- **Backend:** NestJS, TypeORM, Passport (JWT)
- **Database:** PostgreSQL with PostGIS and `pg_trgm`
- **Realtime:** Socket.IO (chat)
- **Hosting:** Vercel (frontend), Render (backend and database)

## Getting Started

### Requirements

- Node.js 24 (see `.nvmrc`, run `fnm use` or `nvm use`)
- npm
- Docker (for the local database)

### Setup

All commands run from the **repository root**. The root is an npm workspace for `frontend` and `backend`, so never run `npm install` inside a subfolder.

```bash
git clone <repository-url>
cd food-swap
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d
npm run migration:run -w backend
npm run dev
```

The frontend runs on http://localhost:5173, the backend on http://localhost:3000. `docker compose up -d` starts a local PostgreSQL with PostGIS on port 5432 (`docker compose down` stops it, the data is kept).

### Environment variables

**`backend/.env`**

| Variable       | Local                                                    | Live                                                                |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/foodswap` | live database URL, ending in `?uselibpqcompat=true&sslmode=require` |
| `JWT_SECRET`   | any string                                               | long random string, never the local one                             |
| `PORT`         | `3000`                                                   | set by the hosting provider                                         |

**`frontend/.env`**

| Variable                       | Local                   | Live             |
| ------------------------------ | ----------------------- | ---------------- |
| `NEXT_PUBLIC_FOODSWAP_API_URL` | `http://localhost:3000` | live backend URL |

Never commit `.env` files, only `.env.example`. When you add a variable, add it to `.env.example` and to the hosting dashboards too.

### Using live data locally (optional)

Copies the live database (schema and data) into your local Docker database. The dump contains real user data: never commit or share it.

```bash
docker compose down -v
docker compose up -d
docker compose exec -T db pg_dump "<LIVE_DATABASE_URL>" --no-owner --no-privileges -Fc > live.dump
docker compose exec -T db pg_restore -U postgres -d foodswap --no-owner --no-privileges < live.dump
npm run migration:run -w backend
rm live.dump
```

Use the live `DATABASE_URL` without `uselibpqcompat=true` (only Node understands it), e.g. `...?sslmode=require`. `docker compose down -v` deletes your local database.

### Updating place data

Places (cities, districts and postal codes) come from [GeoNames](https://download.geonames.org/export/zip/) (CC BY 4.0) and are stored in `backend/data/places-de.tsv`. To update them:

```bash
curl -sSfLO https://download.geonames.org/export/zip/DE.zip
unzip DE.zip -d geonames
npm run places:build -w backend -- geonames/DE.txt
rm -r DE.zip geonames
```

Then create a new migration that applies the changes to `places`. Listings reference places by their ID, so update existing rows (matched on country, postal code, name and county) and add new ones instead of emptying the table. The `AddPlaces` migration only loads the file once.

Place suggestions are cached by the frontend server without expiry. Whenever the place data or the search in `backend/src/places/places.service.ts` changes, bump `PLACES_CACHE_VERSION` in `frontend/src/lib/places.service.ts`, otherwise users keep getting the old suggestions.

## Commands

| Command                                                          | What it does                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| `npm run dev`                                                    | starts backend and frontend                            |
| `npm run dev -w backend`                                         | starts only one project (`-w frontend` / `-w backend`) |
| `npm run build`                                                  | builds both projects                                   |
| `npm run lint`                                                   | lints both projects                                    |
| `npm run lint:fix -w backend`                                    | lints the backend and fixes what can be fixed          |
| `npm run format`                                                 | formats both projects with Prettier                    |
| `npm run format:check -w frontend`                               | checks the frontend formatting without changing files  |
| `npm install -w frontend <package>`                              | adds a package to one project                          |
| `npm run migration:generate -w backend -- src/migrations/<Name>` | creates a migration from entity changes                |
| `npm run migration:run -w backend`                               | applies pending migrations                             |
| `npm run migration:revert -w backend`                            | reverts the last migration                             |

CI runs install, lint, format check and build on every pull request to `main`.

### API requests with Bruno

`backend/bruno` is a [Bruno](https://www.usebruno.com/) collection with requests for every endpoint. Open the folder in Bruno and pick an environment (`local` or `live-server`). Run `auth/Login` (or `auth/Register`) first: it stores the token that the other requests use.

### Test endpoints

- `GET /database/connection`
- `GET /database/tables`

## Deployment

- **Frontend:** Vercel deploys `main` automatically.
- **Backend:** Render deploys `main` automatically with Root Directory `backend`, Build Command `npm install; npm run build` and Start Command `npm run migration:run:prod && npm run start:prod`. Pending migrations run on every deploy. If one fails, the app does not start and Render keeps the previous version running.

## Data sources

Place data (cities, districts and postal codes) © [GeoNames](https://www.geonames.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data was filtered and extended with city entries.

## Team

Built as a team capstone project during the Neue Fische advanced web development bootcamp.

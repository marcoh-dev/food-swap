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
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

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
cp backend/bruno/.env.example backend/bruno/.env
cp frontend/.env.example frontend/.env
docker compose up -d --wait
npm run migration:run -w backend
npm run dev
```

The frontend runs on http://localhost:5173, the backend on http://localhost:3000. `docker compose up -d --wait` starts a local PostgreSQL with PostGIS on port 5432 and waits until it is ready (`docker compose down` stops it, the data is kept).

### Environment variables

**`backend/.env`**

| Variable            | Local                                                         | Live                                                               |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`      | `postgresql://postgres:postgres@localhost:5432/foodswap`      | live database URL, ending in `?sslmode=verify-full`                |
| `TEST_DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/foodswap_test` | not used                                                           |
| `PORT`              | `3000`                                                        | set by the hosting provider                                        |
| `JWT_SECRET`        | any string                                                    | long random string, never the local one                            |
| `CLEANUP_SECRET`    | any string, only needed to call `POST /listings/cleanup`      | long random string, the same as the `CLEANUP_SECRET` GitHub secret |
| `SEED_PASSWORD`     | password of the local mock users, e.g. `'Local-Mock-1!'`      | not used, the live mock password goes into `backend/.env.live`     |

**`backend/.env.live`** (only read by commands with `live` in their name)

| Variable        | Value                                               |
| --------------- | --------------------------------------------------- |
| `DATABASE_URL`  | live database URL, ending in `?sslmode=verify-full` |
| `SEED_PASSWORD` | the stored live mock password                       |

**`backend/bruno/.env`**

| Variable         | Value                               |
| ---------------- | ----------------------------------- |
| `CLEANUP_SECRET` | the same value as in `backend/.env` |

**`frontend/.env`**

| Variable                       | Local                   | Live             |
| ------------------------------ | ----------------------- | ---------------- |
| `NEXT_PUBLIC_FOODSWAP_API_URL` | `http://localhost:3000` | live backend URL |

Never commit `.env` files, only `.env.example`. When you add a variable, add it to `.env.example` and to the hosting dashboards too.

### Using live data locally (optional)

Copies the live database (schema and data) into your local Docker database. The dump contains real user data: never commit or share it.

```bash
docker compose down -v
docker compose up -d --wait
docker compose exec -T db pg_dump "<LIVE_DATABASE_URL>" --no-owner --no-privileges -Fc > live.dump
docker compose exec -T db pg_restore -U postgres -d foodswap --no-owner --no-privileges < live.dump
npm run migration:run -w backend
rm live.dump
```

Use the live `DATABASE_URL` ending in `?sslmode=require` instead of `?sslmode=verify-full` (`pg_dump` would need extra certificate settings for `verify-full`). `docker compose down -v` deletes your local database.

### Updating place data

Places (cities, districts and postal codes) come from [GeoNames](https://download.geonames.org/export/zip/) (CC BY 4.0) and are stored in `backend/data/places-de.tsv`. To update them:

```bash
curl -sSfLO https://download.geonames.org/export/zip/DE.zip
unzip DE.zip -d geonames
npm run places:build -w backend -- geonames/DE.txt
rm -r DE.zip geonames
```

Then create a new migration that applies the changes to `places`. Listings reference places by their ID, so update existing rows (matched on country, postal code, name and county) and add new ones instead of emptying the table. Keep existing `slug` values unchanged, since search URLs (`/listings?place=hamburg`) use them. The `AddPlaces` migration only loads the file once.

Place suggestions are cached by the frontend server without expiry. Whenever the place data or the search in `backend/src/places/places.service.ts` changes, bump `PLACES_CACHE_VERSION` in `frontend/src/lib/places.service.ts`, otherwise users keep getting the old suggestions.

### Mock data

The seed adds 10 mock users (usernames start with `mock_`) with their listings and chats. All mock users get the password from `SEED_PASSWORD`: 8–64 characters with an uppercase and a lowercase letter, a number and a special character. Running the seed again updates the mock data instead of duplicating it and brings back listings the cleanup deleted.

**Local database** (uses `SEED_PASSWORD` from `backend/.env`):

```bash
npm run seed:mock -w backend
```

`npm run seed:mock:remove -w backend` removes the mock users with their listings and chats again.

**Live database** (uses `backend/.env.live`): copy `backend/.env.live.example` to `backend/.env.live` once and fill in the live `DATABASE_URL` and the stored live mock password. A different password changes the mock users' logins. Then run:

```bash
npm run seed:mock:live -w backend
```

Only commands with `live` in their name read `backend/.env.live`, so `backend/.env` always stays local.

Put values containing `&`, `?`, `!`, `#` or `$` in single quotes, in the shell and in `.env` files.

## Commands

| Command                                                          | What it does                                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`                                                    | starts backend and frontend                                                       |
| `npm run sync`                                                   | updates `main`, dependencies, local database and migrations                       |
| `npm run sync:branch`                                            | merges `main` into the current branch (without committing) and updates everything |
| `npm run check`                                                  | runs the same checks as CI (lint, format check, build)                            |
| `npm run dev -w backend`                                         | starts only one project (`-w frontend` / `-w backend`)                            |
| `npm run build`                                                  | builds both projects                                                              |
| `npm run lint`                                                   | lints both projects                                                               |
| `npm run lint:fix`                                               | lints both projects and fixes what can be fixed (e.g. the import style)           |
| `npm run format`                                                 | formats both projects with Prettier                                               |
| `npm run format:check -w frontend`                               | checks the frontend formatting without changing files                             |
| `npm install -w frontend <package>`                              | adds a package to one project                                                     |
| `npm run migration:generate -w backend -- src/migrations/<Name>` | creates a migration from entity changes                                           |
| `npm run migration:run -w backend`                               | applies pending migrations                                                        |
| `npm run migration:revert -w backend`                            | reverts the last migration                                                        |
| `npm run test:e2e -w backend`                                    | runs the backend e2e tests against the test database                              |
| `npm run seed:mock -w backend`                                   | adds or updates the mock data                                                     |
| `npm run seed:mock:live -w backend`                              | adds or updates the mock data in the live database (`backend/.env.live`)          |
| `npm run seed:mock:remove -w backend`                            | removes the mock data                                                             |

`npm run sync` switches to `main`, pulls, installs exactly the locked dependencies (`npm ci`, only if `package-lock.json` changed since the last install), starts the database and runs pending migrations. It stops if you have uncommitted changes that conflict, and it migrates the database in your `backend/.env`, so make sure that points to your local database.

If the dependencies were reinstalled and you use VS Code, run **Developer: Reload Window** (Cmd/Ctrl+Shift+P) afterwards. `npm ci` replaces `node_modules`, and the TypeScript and ESLint servers in VS Code keep using the old files until they restart.

### Import style

ESLint checks the imports in both projects (`import/order`, `import/no-duplicates`):

- Three groups in this order, with one blank line between them: packages (`react`, `next/*`, `typeorm`, …), then `@/…`, then relative paths (`./…`, `../…`).
- Sorted A–Z within each group and inside `{ … }`; two imports from the same file are merged.
- Imports only for side effects (like `import "./globals.css"`) are not moved; put them after the other imports.

`npm run lint:fix` fixes all of this. In VS Code, install the recommended ESLint extension: it shows wrong imports right away, and saving the file fixes them (`.vscode/settings.json`). This also applies to the shadcn files in `components/ui/`, so run `npm run lint:fix` after `npx shadcn add`.

### Tests

`npm run test:e2e -w backend` runs the backend e2e tests against the database in `TEST_DATABASE_URL`. The first run creates it in the local Docker database, and every run applies pending migrations to it. The tests empty the listings, users and chats tables, so `TEST_DATABASE_URL` must never point to your local or the live database; the tests refuse to start if it equals `DATABASE_URL`. The `ExperimentalWarning` about VM modules is expected: Jest needs `--experimental-vm-modules` to load the NestJS packages, which are ES modules.

### Updating a feature branch

Before opening a pull request, bring the latest `main` into your branch and check that everything still works:

```bash
npm run sync:branch
npm run check
git commit
```

`npm run sync:branch` prepares the merge but does not commit it, so you can check it first (`git merge --abort` undoes it). If it reports `Already up to date.` (nothing new on `main`) or `Fast-forward` (your branch had no own commits and was simply moved forward), there is nothing to commit. If the merge has conflicts, it stops right away: resolve them, run `npm install` (not `npm ci`) if `package.json` or `package-lock.json` were affected, then `docker compose up -d --wait`, `npm run migration:run -w backend` and `npm run check` before committing.

CI runs install, lint, format check and build on every pull request to `main`.

### API requests with Bruno

`backend/bruno` is a [Bruno](https://www.usebruno.com/) collection with requests for every endpoint. Open the folder in Bruno and pick an environment (`local` or `live-server`). Run `auth/Login` (or `auth/Register`) first: it stores the token that the other requests use. `listings/Clean up Listings` uses `CLEANUP_SECRET` from `backend/bruno/.env` instead, which has to match the one in `backend/.env`.

### Test endpoints

- `GET /database/connection`
- `GET /database/tables`

## Deployment

- **Frontend:** Vercel deploys `main` automatically.
- **Backend:** Render deploys `main` automatically with Root Directory `backend`, Build Command `npm install; npm run build` and Start Command `npm run migration:run:prod && npm run start:prod`. Pending migrations run on every deploy. If one fails, the app does not start and Render keeps the previous version running.
- **Database:** Neon (free plan, region Frankfurt, Postgres 18), using the direct connection string, not the `-pooler` one. It sleeps after 5 minutes without queries, so the first request after a quiet period takes up to a second longer. The free plan has 1 GB of storage and monthly limits for compute and network transfer; if one is reached, the database stops until the next month.
- **Listing cleanup:** listings are deleted on the 29th day after their end day. The backend does this on startup, daily at 03:00 (only while it is awake) and when `POST /listings/cleanup` is called. On the Render free plan the backend sleeps, so the `Listing cleanup` GitHub workflow (`.github/workflows/cleanup.yml`) calls that endpoint every night at 01:17 UTC, which also wakes it up. It needs the repository variable `BACKEND_URL` (live backend URL, without a trailing slash) and the repository secret `CLEANUP_SECRET` (the same value as on Render). Start it by hand under Actions → Listing cleanup → Run workflow; the log shows how many listings were deleted. GitHub pauses scheduled workflows after 60 days without repository activity; the cleanup on startup still runs then.

## Data sources

Place data (cities, districts and postal codes) © [GeoNames](https://www.geonames.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data was filtered and extended with city entries.

## Team

Built as a team capstone project during the Neue Fische advanced web development bootcamp.

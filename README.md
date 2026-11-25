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
- **Mobile:** Expo (React Native), expo-router, NativeWind 5 (RC), React Native Reusables
- **Database:** PostgreSQL with PostGIS and `pg_trgm`
- **Realtime:** Socket.IO (chat)
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Getting Started

### Requirements

- Node.js 24 (see `.nvmrc`, run `fnm use` or `nvm use`)
- pnpm 12 (`brew install pnpm`, see `devEngines` in `package.json`; npm is blocked)
- Docker (for the local database)

### Setup

All commands run from the **repository root**. The root is a pnpm workspace for `frontend`, `backend`, `mobile` and `shared` (`pnpm-workspace.yaml`), and `pnpm install` always installs all of them.

```bash
git clone <repository-url>
cd food-swap
pnpm install
cp backend/.env.example backend/.env
cp backend/bruno/.env.example backend/bruno/.env
cp frontend/.env.example frontend/.env
cp mobile/.env.example mobile/.env.local
docker compose up -d --wait
pnpm --filter backend migration:run
pnpm dev
```

The frontend runs on http://localhost:5173, the backend on http://localhost:3000. `docker compose up -d --wait` starts a local PostgreSQL with PostGIS on port 5432 and waits until it is ready (`docker compose down` stops it, the data is kept).

### Mobile app

The Expo app lives in `mobile/`. It uses the same colours as the web app (`shared/theme.css`) and follows the phone's light/dark mode.

```bash
pnpm mobile
```

Scan the QR code with **Expo Go** (App Store / Play Store; it must support Expo SDK 58). The phone and the computer need to be on the same Wi-Fi; otherwise use `pnpm mobile --tunnel`. The app needs the backend URL in `mobile/.env.local` (see below).

Styling uses NativeWind 5, which is still a release candidate. `nativewind` and `react-native-css` are pinned to exact versions, and `lightningcss` is pinned to 1.30.1 for the whole workspace (`pnpm-workspace.yaml`). Don't update these three without testing the app.

### Shared package

`shared/` (`@food-swap/shared`) holds what web and mobile both use, so it exists only once:

| Import                           | Content                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@food-swap/shared/theme.css`    | colours for light and dark mode (each app decides what `dark` means: the `.dark` class on the web, the phone setting on mobile)                         |
| `@food-swap/shared/types`        | API types: the shapes the backend sends and receives (`ListingResponse`, `User`, `CurrentUser`, …)                                                      |
| `@food-swap/shared/schemas/user` | zod schemas for login, registration and profile, with their validation messages                                                                         |
| `@food-swap/shared/dates`        | dates and times in Berlin time (`getDaysUntil`, `getBerlinDay`, `formatTime`, `formatDate`), the "ends soon" limit and the end date and deletion labels |
| `@food-swap/shared/places`       | places as text: `formatPlace` shows a place as "PLZ Ort" (e.g. `22765 Hamburg`), or just the name if it has no postal code                              |
| `@food-swap/shared/messages`     | texts used by both apps (e.g. the login error)                                                                                                          |
| `@food-swap/shared/assets/*`     | images both apps use (e.g. `listing-placeholder.svg`, the logo shown for listings without an image)                                                     |

Things that only one app needs stay in that app (e.g. `frontend/src/lib/types`, `frontend/src/lib/schemas`, fonts and text sizes in `frontend/src/app/globals.css`); more can move to `shared` once both apps need it. The package has no build step: it exports its TypeScript files directly, Metro handles them, and Next.js compiles them through `transpilePackages` in `next.config.ts`. Inside `shared` there is no `@/` alias, so it uses relative imports. New files need an entry in `exports` in `shared/package.json`.

### Login and tokens

Login and registration return two tokens:

| Token         | Lifetime   | Sent with                           | Can be revoked                                       |
| ------------- | ---------- | ----------------------------------- | ---------------------------------------------------- |
| Access token  | 15 minutes | every API request (`Authorization`) | no, it's only checked by its signature               |
| Refresh token | 30 days    | only `POST /auth/refresh`           | yes, it's stored (as a SHA-256 hash) in the database |

`POST /auth/refresh` exchanges a refresh token for a new pair. The old refresh token keeps working for 60 more seconds, because several requests can renew with the same token at the same time; after that it expires. `POST /auth/logout` deletes the refresh token, and deleting an account deletes all of its refresh tokens. `POST /auth/logout-all` ("Überall abmelden") deletes all refresh tokens of the user, closes their chat connections and stores the time in `users.loggedOutEverywhereAt`; access tokens issued before it are rejected, so other devices are logged out on their next request. Open browser tabs and the app notice it right away: when the server closes their chat connection, the tabs reload the page data and show the logged-out state, and the app logs out. So users are only logged out after 30 days without using the app or the site.

- **Web:** both tokens are in httpOnly cookies (`auth_token`, `refresh_token`), so the browser's JavaScript can't read them. The access cookie ends after 14 minutes, a minute before the token. When it's gone, `frontend/src/proxy.ts` renews both tokens before the request and passes the new access token on to that request. Pages and server actions read the access cookie as before (`fetchAPI`).
- **Mobile:** both tokens are in SecureStore. When a request gets a 401, `mobile/src/api/request.ts` renews the tokens once and repeats the request; requests that fail at the same time share one renewal. If the renewal fails, the app logs out.
- **Chat socket:** the socket doesn't accept access tokens. `POST /chats/socket-ticket` returns a ticket that is valid for 60 seconds and only works for the socket handshake; the web app fetches a new one through a server action and the mobile app through a normal request on every connection attempt.

### Usernames

Usernames may contain letters (incl. ä, ö, ü, ß), digits, `_`, `.` and `-`, and are unique regardless of case (`Tomate` and `tomate` are the same; login works in any spelling, the name is shown as typed). Names that could be mistaken for the FoodSwap team or for something the app shows (e.g. `admin`, `support`, "Gelöschtes Konto", anything with "foodswap") can't be used as username or profile name; the list is in `shared/src/reservedNames.ts`, with a copy in `backend/src/users/reservedNames.ts` that a test keeps in sync.

### Rate limits

The backend limits requests per IP (`backend/src/common/rateLimits.ts`) and answers `429` above a limit: login 20 per 15 minutes, registration 10 per hour, everything else 300 per minute.

- Per IP, not per username, so nobody can lock out another user by spamming their username.
- Website requests come from the Next.js server, so it forwards the user's IP in `X-Client-IP` together with `INTERNAL_API_SECRET`; the backend ignores the header without the secret.
- Only HMACs of the IPs are kept, in memory and only for the time window. Blocks are logged (`[RateLimit]`) without the IP.

### Chat data flow (web)

The web chat keeps its data in the TanStack Query cache, like the app, with the same keys (`["chats", …]`) and the same cache updates from `@food-swap/shared/chat-cache` (`shared/src/chatCache.ts`). The hooks are in `frontend/src/lib/chatQueries.ts`. The data comes in two ways:

- **Loading and sending** go through server actions (`frontend/src/app/chats/actions.ts`). They run on the Next.js server, read the login token from the `auth_token` cookie and call the backend's REST API (`/chats`). The hooks call these actions; `frontend/src/lib/fromAction.ts` turns an action's error text into an error for TanStack Query.
- **Live updates** come through Socket.IO. `ChatSocketConnector` (in the root layout) connects the browser to the backend with a ticket that is valid for one minute (fetched through a server action on every connection attempt, so the login token never reaches the browser), through `connectChat` in `frontend/src/lib/chatEvents.ts`, which registers all socket listeners in one place and writes the events into the cache. The backend puts each user in their own room (`user:<id>`) and sends three events:

    | Event         | Sent when                                                 | Effect in the browser                                                               |
    | ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
    | `newMessage`  | someone sends a message (to both participants)            | the chat moves to the top of the list, the open chat shows it, unread count updates |
    | `chatRead`    | a user opened a chat (only to that user, e.g. other tabs) | the chat is no longer marked unread, unread count updates                           |
    | `chatRemoved` | a user deleted a chat (only to that user)                 | the chat disappears from the list and closes if it's open                           |

After a reconnect, all `["chats"]` queries are reloaded, because events sent while offline are lost; logging out removes them from the cache. A small Zustand store (`frontend/src/store/chat.store.ts`) only holds what isn't chat data: the logged-in user, which chat is open, whether it's scrolled to its newest message and whether the tab is visible.

- **Marking as read:** like in the app, an open chat is marked read only when its newest message is from the other person and seen: the tab is visible and the chat is scrolled to the newest message (`ChatConversation`). A message that arrives while the user is scrolled up or the tab is hidden keeps the chat unread until then; while scrolled up, the button at the bottom shows "Neue Nachricht" and scrolls down. Sending a message while scrolled up scrolls down to it.
- **Drafts:** unsent text is kept per chat, and per listing for a first message, in the tab's `sessionStorage` (`frontend/src/lib/chatDrafts.ts`) until it's sent successfully, also after switching chats, a failed send or a reload; logging out removes them.

Browser notifications are also shown from the `newMessage` listener in `chatEvents.ts` (helpers in `frontend/src/lib/notifications.ts`; `NotificationPermissionPrompt` asks for the permission). They show a notification for messages from others, unless that chat is open in a visible tab. Whether notifications are on is stored per browser in `localStorage` and can be changed in the profile.

### Chat data flow (app)

The app keeps all chat data in the TanStack Query cache, under keys starting with `["chats"]` (`@food-swap/shared/chat-cache`, plus the listing keys in `mobile/src/api/chats.ts`): the list, the unread count (the badge on the Chats tab), each open conversation and, per listing, whether you already have a chat about it.

- **Loading and sending** go straight to the REST API with the login token (`mobile/src/api/request.ts`).
- **Live updates** come through Socket.IO. `connectChatSocket` (`mobile/src/lib/chatSocket.ts`, started by `ChatSocketConnector` while logged in, like on the web) gets the same three events as the web and writes them into the cache with `setQueryData`, so all screens update without reloading; `addMessageToCache` (shared with the web) adds a message only once, because your own messages arrive both as the answer to sending and over the socket. The socket is only connected while the app is in the foreground; after every reconnect, all `["chats"]` queries are reloaded, because events sent meanwhile are lost. If the server ends the connection because the login is no longer valid, the app logs out.
- **Marking as read:** an open chat is marked read only when its newest message is from the other person and visible: the screen is shown, the app is in the foreground, the user is online and scrolled to the newest message (`mobile/src/app/chats/[id].tsx`).
- **Starting a chat:** the message card on another person's listing (`mobile/src/components/ListingChatCard.tsx`) asks `GET /chats/listing/:listingId` whether you already have a chat there. Without one, or if you deleted it, the first message goes to `POST /chats`, which also brings back a deleted chat. With a chat, "Zum Chat" opens it on top of the Chats tab, so back leads to the chat list.
- **Deleting a chat** (header button in the conversation) hides it only for you (`DELETE /chats/:id`); the other person keeps it until they delete it too. The app removes it from the cached list and goes to the Chats tab; the socket's `chatRemoved` event does the same on your other devices and reloads the listing cards.
- **Drafts:** unsent text is kept in memory (`mobile/src/lib/chatDrafts.ts`), per chat and per listing for a first message, until it's sent successfully, also after leaving the screen or a failed send; it's gone after closing the app or logging out.

### Environment variables

**`backend/.env`**

| Variable              | Local                                                         | Live                                                               |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`        | `postgresql://postgres:postgres@localhost:5432/foodswap`      | live database URL, ending in `?sslmode=verify-full`                |
| `TEST_DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5432/foodswap_test` | not used                                                           |
| `PORT`                | `3000`                                                        | set by the hosting provider                                        |
| `JWT_SECRET`          | any string                                                    | long random string, never the local one                            |
| `CLEANUP_SECRET`      | any string, only needed to call `POST /listings/cleanup`      | long random string, the same as the `CLEANUP_SECRET` GitHub secret |
| `SEED_PASSWORD`       | password of the local mock users, e.g. `'Local-Mock-1!'`      | not used, the live mock password goes into `backend/.env.live`     |
| `INTERNAL_API_SECRET` | any string, the same as in `frontend/.env`                    | long random string, the same as on Vercel                          |

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

| Variable                       | Local                         | Live                                                       |
| ------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_FOODSWAP_API_URL` | `http://localhost:3000`       | live backend URL                                           |
| `INTERNAL_API_SECRET`          | the same as in `backend/.env` | the same as on Render; never prefix it with `NEXT_PUBLIC_` |

**`mobile/.env.local`**

| Variable              | Local                                                     | Live             |
| --------------------- | --------------------------------------------------------- | ---------------- |
| `EXPO_PUBLIC_API_URL` | `http://<your computer's network IP>:3000`, not localhost | live backend URL |

The phone can't reach `localhost`. Find your computer's network IP under System Settings → Wi-Fi → Details. With the live URL, the first request can take up to a minute while Render wakes up. Expo builds the value into the app, so restart with `pnpm mobile --clear` after changing it. If it is missing or invalid, the app shows a configuration error.

Generate long random strings with `openssl rand -base64 32 | tr '+/' '-_' | tr -d '='`. The mobile app never gets `INTERNAL_API_SECRET`: anything in an app can be read by unpacking it.

Never commit `.env` files, only `.env.example`. When you add a variable, add it to `.env.example` and to the hosting dashboards too.

### Using live data locally (optional)

Copies the live database (schema and data) into your local Docker database. The dump contains real user data: never commit or share it.

```bash
docker compose down -v
docker compose up -d --wait
docker compose exec -T db pg_dump "<LIVE_DATABASE_URL>" --no-owner --no-privileges -Fc > live.dump
docker compose exec -T db pg_restore -U postgres -d foodswap --no-owner --no-privileges < live.dump
pnpm --filter backend migration:run
rm live.dump
```

Use the live `DATABASE_URL` ending in `?sslmode=require` instead of `?sslmode=verify-full` (`pg_dump` would need extra certificate settings for `verify-full`). `docker compose down -v` deletes your local database.

### Updating place data

Places (cities, districts and postal codes) come from [GeoNames](https://download.geonames.org/export/zip/) (CC BY 4.0) and are stored in `backend/data/places-de.tsv`. To update them:

```bash
curl -sSfLO https://download.geonames.org/export/zip/DE.zip
unzip DE.zip -d geonames
pnpm --filter backend places:build geonames/DE.txt
rm -r DE.zip geonames
```

Then create a new migration that applies the changes to `places`. Listings reference places by their ID, so update existing rows (matched on country, postal code, name and county) and add new ones instead of emptying the table. Keep existing `slug` values unchanged, since search URLs (`/listings?place=hamburg`) use them. The `AddPlaces` migration only loads the file once.

Place suggestions are cached by the frontend server without expiry. Whenever the place data or the search in `backend/src/places/places.service.ts` changes, bump `PLACES_CACHE_VERSION` in `frontend/src/lib/places.service.ts`, otherwise users keep getting the old suggestions.

### Mock data

The seed adds 11 mock users (usernames start with `mock_`) with their listings and chats. All mock users get the password from `SEED_PASSWORD`: 8–64 characters with an uppercase and a lowercase letter, a number and a special character. Running the seed again updates the mock data instead of duplicating it and brings back listings the cleanup deleted. Data that wasn't created by the seed stays untouched.

All mock dates are relative to the day the seed runs, so running it again moves them to the current date: some listings ended in the last weeks, every day of the next six weeks has listings ending (several each for today up to in 7 days), the rest end within the next months. Four listings ended 28–29 days ago, so the nightly cleanup deletes them, which shows that it works. Mock users registered 4 to 18 months ago, and chat messages are timed relative to their listing. The date formats are explained at the top of `backend/src/seeds/mock/listings.ts`.

For testing the chats, `mock_gerda` has no chats, and `mock_jana` has 24: six are unread, one is with a deleted account, one about a deleted listing, one with `mock_friederike` (a very long name and listing title), and the one with `mock_ole` about the basil has 80 messages over several days, often several in the same minute and sometimes several from the same person a few minutes apart. Running the seed again marks the chats as read or unread as in `backend/src/seeds/mock/chats.ts`.

**Local database** (uses `SEED_PASSWORD` from `backend/.env`):

```bash
pnpm --filter backend seed:mock
```

`pnpm --filter backend seed:mock:remove` removes the mock users with their listings and chats again.

**Live database** (uses `backend/.env.live`): copy `backend/.env.live.example` to `backend/.env.live` once and fill in the live `DATABASE_URL` and the stored live mock password. A different password changes the mock users' logins. Then run:

```bash
pnpm --filter backend seed:mock:live
```

Only commands with `live` in their name read `backend/.env.live`, so `backend/.env` always stays local.

Put values containing `&`, `?`, `!`, `#` or `$` in single quotes, in the shell and in `.env` files.

## Commands

| Command                                                          | What it does                                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `pnpm dev`                                                       | starts backend and frontend                                                       |
| `pnpm mobile`                                                    | starts the Expo dev server for the mobile app                                     |
| `pnpm sync`                                                      | updates `main`, dependencies, local database and migrations                       |
| `pnpm sync:branch`                                               | merges `main` into the current branch (without committing) and updates everything |
| `pnpm check`                                                     | lint, format check and typecheck in all projects                                  |
| `pnpm --filter backend dev`                                      | starts only one project (`--filter frontend` / `--filter backend`)                |
| `pnpm build`                                                     | builds both projects                                                              |
| `pnpm lint`                                                      | lints all projects                                                                |
| `pnpm lint:fix`                                                  | lints all projects and fixes what can be fixed (e.g. the import style)            |
| `pnpm format`                                                    | formats all projects with Prettier                                                |
| `pnpm format:check`                                              | checks the formatting of all files without changing them                          |
| `pnpm typecheck`                                                 | checks the TypeScript types of all projects                                       |
| `pnpm --filter frontend add <package>`                           | adds a package to one project                                                     |
| `pnpm --filter backend migration:generate src/migrations/<Name>` | creates a migration from entity changes                                           |
| `pnpm --filter backend migration:run`                            | applies pending migrations                                                        |
| `pnpm --filter backend migration:revert`                         | reverts the last migration                                                        |
| `pnpm test`                                                      | runs the unit tests of both projects                                              |
| `pnpm --filter backend test:integration`                         | runs the backend integration tests against the test database                      |
| `pnpm --filter backend seed:mock`                                | adds or updates the mock data                                                     |
| `pnpm --filter backend seed:mock:live`                           | adds or updates the mock data in the live database (`backend/.env.live`)          |
| `pnpm --filter backend seed:mock:remove`                         | removes the mock data                                                             |

`pnpm sync` switches to `main`, pulls, installs exactly the locked dependencies (`pnpm install`, which skips quickly when nothing changed), starts the database and runs pending migrations. It stops if you have uncommitted changes that conflict, and it migrates the database in your `backend/.env`, so make sure that points to your local database.

If the dependencies changed and you use VS Code, run **Developer: Reload Window** (Cmd/Ctrl+Shift+P) afterwards, because the TypeScript and ESLint servers keep using the old files until they restart.

### Code style

All projects share one Prettier config (`.prettierrc` in the root): tabs, double quotes, 100 characters per line. In the frontend and the mobile app, `prettier-plugin-tailwindcss` also sorts the Tailwind classes in `className`, `cn()` and `cva()`.

ESLint checks the imports in both projects (`import/order`, `import/no-duplicates`):

- Three groups in this order, with one blank line between them: packages (`react`, `next/*`, `typeorm`, …), then `@/…`, then relative paths (`./…`, `../…`).
- Sorted A–Z within each group and inside `{ … }`; two imports from the same file are merged.
- Frontend and mobile: `@/…` for files outside the current folder, `./…` for files in the same folder; `../…` is not allowed. The backend and `shared` have no `@/` alias and use relative paths.
- Imports only for side effects (like `import "./globals.css"`) are not moved; put them after the other imports.

Other rules: `any` and unused variables or imports are errors, the frontend uses the recommended accessibility rules of `eslint-plugin-jsx-a11y`, and TypeScript runs with `noUncheckedIndexedAccess`, so `list[0]` has the type `T | undefined`.

In VS Code, open the repository folder itself (not a parent folder), so `.vscode/settings.json` applies, and install the recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense; CSS files open in Tailwind mode, so `@theme` and similar rules are not flagged). Wrong imports are then shown right away, saving a file formats it and fixes the import order (`.vscode/settings.json`), and auto-imports use `@/…`. From the terminal, `pnpm lint:fix` and `pnpm format` do the same. Only `../…` imports are not fixed automatically; change them to `@/…` by hand. This also applies to the shadcn files in `components/ui/`, so run both commands after `pnpm --filter frontend shadcn add`. The same applies to the React Native Reusables files in `mobile/src/components/ui/`.

### Tests

- **Unit tests** check single functions without a database. They live next to the code: `*.spec.ts` in the backend (Jest), `*.test.ts` in the frontend and in `shared` (Vitest). `pnpm test` runs them, and so does CI.
- **Integration tests** start the backend and send real HTTP requests against a test database. They live in `backend/test/*.integration-spec.ts` and need a database: locally the Docker database, in CI a Postgres service.

`pnpm --filter backend test:integration` runs the backend integration tests against the database in `TEST_DATABASE_URL`. The first run creates it in the local Docker database, and every run applies pending migrations to it. The tests empty the listings, users and chats tables, so `TEST_DATABASE_URL` must never point to your local or the live database; the tests refuse to start if it equals `DATABASE_URL`. The `ExperimentalWarning` about VM modules is expected: Jest needs `--experimental-vm-modules` to load the NestJS packages, which are ES modules.

### Updating a feature branch

Before opening a pull request, bring the latest `main` into your branch and check that everything still works:

```bash
pnpm sync:branch
pnpm check
pnpm test
pnpm --filter backend test:integration
git commit
```

`pnpm sync:branch` prepares the merge but does not commit it, so you can check it first (`git merge --abort` undoes it). If it reports `Already up to date.` (nothing new on `main`) or `Fast-forward` (your branch had no own commits and was simply moved forward), there is nothing to commit. If the merge has conflicts, it stops right away: resolve them, run `pnpm install` if `package.json` or `pnpm-lock.yaml` were affected, then `docker compose up -d --wait`, `pnpm --filter backend migration:run`, `pnpm check` and the tests before committing.

CI runs `pnpm check`, the unit tests, the integration tests and the build on every pull request to `main`.

### API requests with Bruno

`backend/bruno` is a [Bruno](https://www.usebruno.com/) collection with requests for every endpoint. Open the folder in Bruno and pick an environment (`local` or `live-server`). Run `auth/Login` (or `auth/Register`) first: it stores the access token that the other requests use and the refresh token for `auth/Refresh` and `auth/Logout`. The access token expires after 15 minutes; run `auth/Refresh` (or `auth/Login`) again then. `listings/Clean up Listings` uses `CLEANUP_SECRET` from `backend/bruno/.env` instead, which has to match the one in `backend/.env`.

## Deployment

- **Frontend:** Vercel deploys `main` automatically.
- **Backend:** Render deploys `main` automatically with an empty Root Directory, Build Command `pnpm install --frozen-lockfile --filter backend && pnpm --filter backend build` and Start Command `pnpm --filter backend migration:run:prod && pnpm --filter backend start:prod`. Pending migrations run on every deploy. If one fails, the app does not start and Render keeps the previous version running.
- **Database:** Neon (free plan, region Frankfurt, Postgres 18), using the direct connection string, not the `-pooler` one. It sleeps after 5 minutes without queries, so the first request after a quiet period takes up to a second longer. The free plan has 1 GB of storage and monthly limits for compute and network transfer; if one is reached, the database stops until the next month.
- **Listing cleanup:** listings are deleted on the 29th day after their end day. The backend does this on startup, daily at 03:00 (only while it is awake) and when `POST /listings/cleanup` is called. On the Render free plan the backend sleeps, so the `Listing cleanup` GitHub workflow (`.github/workflows/cleanup.yml`) calls that endpoint every night at 01:17 UTC, which also wakes it up. It needs the repository variable `BACKEND_URL` (live backend URL, without a trailing slash) and the repository secret `CLEANUP_SECRET` (the same value as on Render). Start it by hand under Actions → Listing cleanup → Run workflow; the log shows how many listings were deleted. GitHub pauses scheduled workflows after 60 days without repository activity; the cleanup on startup still runs then.

## Data sources

Place data (cities, districts and postal codes) © [GeoNames](https://www.geonames.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data was filtered and extended with city entries.

## Team

Built as a team capstone project during the Neue Fische advanced web development bootcamp.

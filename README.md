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
pnpm db:up
pnpm --filter backend migration:run
pnpm dev
```

The frontend runs on http://localhost:5173, the backend on http://localhost:3000. `pnpm db:up` starts a local PostgreSQL with PostGIS on port 5432 in Docker and waits until it is ready; `pnpm dev` does that too before it starts. `pnpm db:down` stops it (the data is kept). `pnpm db:reset` deletes the local database and creates it again with the migrations (categories, tags and places, no users or listings); `pnpm db:reset:mock` does the same and adds the mock data.

### Mobile app

The Expo app lives in `mobile/`. It uses the same colours as the web app (`shared/theme.css`) and follows the phone's light/dark mode.

```bash
pnpm mobile
```

The phone and the computer need to be on the same Wi-Fi; otherwise use `pnpm mobile --tunnel`. The app needs the backend URL in `mobile/.env.local` (see below).

**Development build (Android):** the app runs in its own development build instead of Expo Go, because push notifications don't work in Expo Go. The build contains only the native part (libraries with native code, icon, permissions); the JavaScript still comes from `pnpm mobile`, so pulling and restarting is enough for code changes.

- **Installing:** open the newest development build on [expo.dev](https://expo.dev) (organization `food-swap`, project `food-swap`, Builds) on the phone, or scan its QR code, and install the APK; Android asks once to allow installing apps from the browser. Ask the team to invite you to the organization. To update, install a newer build over the old one; login and data stay.
- **Using:** start `pnpm mobile` and open the FoodSwap app; it lists the computer's dev server, or scan the QR code from the terminal with it.
- **New build:** only needed for native changes: a new library with native code, plugins, icons or permissions in `mobile/app.config.ts`, an Expo SDK upgrade. Run `eas build --profile development --platform android` in `mobile/` (EAS CLI: `brew install eas-cli`, then `eas login`). The free plan allows 15 Android builds a month, so collect native changes and say in the team before starting one.
- **Expo Go** (App Store / Play Store, it must support Expo SDK 58) still works for everything except push: press `s` in the terminal to switch `pnpm mobile` to Expo Go. On iPhones it's the only option for now, since iOS builds need the paid Apple Developer Program.

**Preview build (Android):** a standalone APK with the JavaScript included that talks to the live backend, for presenting and testing without a computer: `eas build --profile preview --platform android` in `mobile/`. Every change needs a new preview build.

**Build setup** (`mobile/eas.json`, `mobile/app.config.ts`): the EAS project `@food-swap/food-swap` belongs to the Expo organization `food-swap`. Android pushes go through Firebase Cloud Messaging (Firebase project `foodswap-eddc6`, Android app `dev.marcoh.foodswap`). Its config file `google-services.json` is not in the repo: EAS builds get it from the EAS environment variable `GOOGLE_SERVICES_JSON` (a file variable), and local native builds read `mobile/google-services.json` (git-ignored; ask the team). The Firebase service account key that Expo sends pushes with is uploaded to EAS only (`eas credentials`).

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
| `@food-swap/shared/sorting`      | sort options as text: `SORT_LABELS` names each sort option for the menu (e.g. `endingSoon` → "Endet bald")                                              |
| `@food-swap/shared/messages`     | texts used by both apps (e.g. the login error)                                                                                                          |
| `@food-swap/shared/assets/*`     | images both apps use (e.g. `listing-placeholder.svg`, the logo shown for listings without an image)                                                     |

Things that only one app needs stay in that app (e.g. `frontend/src/lib/types`, `frontend/src/lib/schemas`, fonts and text sizes in `frontend/src/app/globals.css`); more can move to `shared` once both apps need it. The package has no build step: it exports its TypeScript files directly, Metro handles them, and Next.js compiles them through `transpilePackages` in `next.config.ts`. Inside `shared` there is no `@/` alias, so it uses relative imports. New files need an entry in `exports` in `shared/package.json`.

### Login and tokens

Login and registration return two tokens:

| Token         | Lifetime   | Sent with                           | Can be revoked                                       |
| ------------- | ---------- | ----------------------------------- | ---------------------------------------------------- |
| Access token  | 15 minutes | every API request (`Authorization`) | no, it's only checked by its signature               |
| Refresh token | 30 days    | only `POST /auth/refresh`           | yes, it's stored (as a SHA-256 hash) in the database |

`POST /auth/refresh` exchanges a refresh token for a new pair. The old refresh token keeps working for 60 more seconds, because several requests can renew with the same token at the same time; after that it expires. `POST /auth/logout` deletes the refresh token, and deleting an account deletes all of its refresh tokens. `POST /auth/logout-all` ("Überall abmelden") deletes all refresh tokens of the user, closes their chat connections and stores the time in `users.loggedOutEverywhereAt`; access tokens issued before it are rejected, so other devices are logged out on their next request. Open browser tabs and the app notice it right away: when the server closes their chat connection, the tabs reload the page data and show the logged-out state, and the app logs out. Logging in, logging out or switching accounts in one browser tab updates the other open tabs of the same browser too (`AuthSync` with a `BroadcastChannel`, `frontend/src/lib/authSync.ts`). So users are only logged out after 30 days without using the app or the site.

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

Browser notifications are also shown from the `newMessage` listener in `chatEvents.ts` (helpers in `frontend/src/lib/notifications.ts`; `NotificationPermissionPrompt` asks for the permission). They show a notification for messages from others, unless that chat is open in a visible tab. Whether notifications are on is stored per browser in `localStorage` and can be changed in the profile. Once a browser has a push subscription, the service worker shows the notifications instead and the tab stays silent, so each message shows once (see "Push notifications").

### Chat data flow (app)

The app keeps all chat data in the TanStack Query cache, under keys starting with `["chats"]` (`@food-swap/shared/chat-cache`, plus the listing keys in `mobile/src/api/chats.ts`): the list, the unread count (the badge on the Chats tab), each open conversation and, per listing, whether you already have a chat about it.

- **Loading and sending** go straight to the REST API with the login token (`mobile/src/api/request.ts`).
- **Live updates** come through Socket.IO. `connectChatSocket` (`mobile/src/lib/chatSocket.ts`, started by `ChatSocketConnector` while logged in, like on the web) gets the same three events as the web and writes them into the cache with `setQueryData`, so all screens update without reloading; `addMessageToCache` (shared with the web) adds a message only once, because your own messages arrive both as the answer to sending and over the socket. The socket is only connected while the app is in the foreground; after every reconnect, all `["chats"]` queries are reloaded, because events sent meanwhile are lost. If the server ends the connection because the login is no longer valid, the app logs out.
- **Marking as read:** an open chat is marked read only when its newest message is from the other person and visible: the screen is shown, the app is in the foreground, the user is online and scrolled to the newest message (`mobile/src/app/chats/[id].tsx`).
- **Starting a chat:** the message card on another person's listing (`mobile/src/components/ListingChatCard.tsx`) asks `GET /chats/listing/:listingId` whether you already have a chat there. Without one, or if you deleted it, the first message goes to `POST /chats`, which also brings back a deleted chat. With a chat, "Zum Chat" opens it on top of the Chats tab, so back leads to the chat list.
- **Deleting a chat** (header button in the conversation) hides it only for you (`DELETE /chats/:id`); the other person keeps it until they delete it too. The app removes it from the cached list and goes to the Chats tab; the socket's `chatRemoved` event does the same on your other devices and reloads the listing cards.
- **Drafts:** unsent text is kept in memory (`mobile/src/lib/chatDrafts.ts`), per chat and per listing for a first message, until it's sent successfully, also after leaving the screen or a failed send; it's gone after closing the app or logging out.

### Push notifications

New chat messages also go out as push notifications to the recipient's devices, so they arrive when no FoodSwap tab is open or the app is closed (web push, #112; the Android app, #176). The backend part is in `backend/src/push/`:

- **Subscriptions:** a device that allows notifications sends its subscription to `POST /push-subscriptions`: a browser with the type `web` (endpoint at the browser's push service plus two keys), the app with the type `expo` (its Expo push token, `ExponentPushToken[…]`, as the endpoint, no keys). `DELETE /push-subscriptions` removes it. They're stored per device in `push_subscriptions`, renewed on each visit or app start (`lastSeenAt`) and moved to another account if one logs in on the same device.
- **Sending:** after a chat message is saved, `ChatsService` hands it to `PushService` in the background, so a failed push never fails the message. Only the other person gets it, on all their devices; the texts are built in `pushMessage.ts` (the same as the web's in-tab notification). Browsers get it through web push; subscriptions the push service no longer knows (404/410) are deleted. The app gets it through Expo's push service (`expo-server-sdk`), which delivers through Firebase Cloud Messaging on Android; the message carries the chat ID (to open the chat on tap) and the Android channel `chat-messages` (`CHAT_CHANNEL_ID`, which the app must create); tokens Expo reports as `DeviceNotRegistered` (e.g. app uninstalled) are deleted.
- **Ending:** "Überall abmelden" deletes all of a user's subscriptions; a daily job (and one on startup) deletes those not renewed within the login lifetime (`REFRESH_TOKEN_DAYS`); deleting an account deletes its subscriptions.
- **Keys:** web push needs a VAPID key pair (see the environment variables). Without it, everything works, only no web pushes are sent, which is fine for local development and the tests. Pushes to the app need no keys in the backend: Expo sends them with the Firebase key stored in the EAS project.

In the web:

- **Service worker** (`frontend/public/sw.js`, plain JavaScript served as `/sw.js`): the browser wakes it for each push, also with no FoodSwap tab open. It shows the notification, unless a visible tab has exactly that chat open, and a click opens the chat in an open tab or a new window.
- **Subscribing** (`frontend/src/lib/webPush.ts`): with the permission granted and notifications switched on in the profile, the browser subscribes with `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and sends the subscription to the backend through a server action (the login token stays in its cookie). This happens on every page load (`WebPushSubscriber`, which also renews it), after "Aktivieren" in the prompt and when the setting is turned on. Turning the setting off and logging out end it, on the backend first. If saving fails, the subscription ends again, so the in-tab notifications take over.
- **Home screen:** `frontend/src/app/manifest.ts` and the icons (`frontend/public/icon-*.png`, `frontend/src/app/apple-icon.png`) let browsers add FoodSwap to the home screen; iPhones and iPads only get web push that way (iOS 16.4+).
- **Differences between browsers:** how pushes arrive depends on the browser, not on FoodSwap. Some deliver them even when the browser is closed, others only while it's running; some install FoodSwap from the home screen as its own app, others only add a shortcut that opens in the browser; and not every browser lets a notification click switch to an open tab (the click then opens the chat in a new tab).

In the app (Android only, `mobile/src/lib/pushNotifications.ts`; needs the development or preview build):

- **Permission:** after the first sent message, the app asks once with a short explanation ("Später" / "Aktivieren"), then with Android's dialog. The profile shows whether notifications are on; its "Benachrichtigungen" button asks if Android hasn't asked yet, otherwise it opens the app's notification settings.
- **Token:** with the permission granted, the app gets its Expo push token and sends it to `POST /push-subscriptions` on every app start while logged in (which renews it) and right after logging in or turning notifications on. Logging out removes it first, while the request is still authorised.
- **Showing:** Android shows the notifications in the channel "Chat-Nachrichten" (created at app start) with the white tomato as the small icon. While the app is in the foreground, none are shown, since the chat updates live there. Tapping one opens the chat (`NotificationTapHandler`), also when the tap starts the app.
- **Double notifications:** someone who uses the app and also allowed web notifications in a browser on the same phone gets each message twice (two separate subscriptions). Turn off the browser's notifications in the web profile when using the app.

### Environment variables

**`backend/.env`**

| Variable              | Local                                                                                                       | Live                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`        | `postgresql://postgres:postgres@localhost:5432/foodswap`                                                    | live database URL, ending in `?sslmode=verify-full`                       |
| `TEST_DATABASE_URL`   | `postgresql://postgres:postgres@localhost:5432/foodswap_test`                                               | not used                                                                  |
| `PORT`                | `3000`                                                                                                      | set by the hosting provider                                               |
| `JWT_SECRET`          | any string                                                                                                  | long random string, never the local one                                   |
| `CLEANUP_SECRET`      | any string, only needed to call `POST /listings/cleanup`                                                    | long random string, the same as the `CLEANUP_SECRET` GitHub secret        |
| `SEED_PASSWORD`       | password of the local mock users, e.g. `'Local-Mock-1!'`                                                    | not used, the live mock password goes into `backend/.env.live`            |
| `INTERNAL_API_SECRET` | any string, the same as in `frontend/.env`                                                                  | long random string, the same as on Vercel                                 |
| `VAPID_PUBLIC_KEY`    | optional, for web push: generate a pair once with `pnpm --filter backend exec web-push generate-vapid-keys` | its own pair, generated once and kept (a new pair ends all subscriptions) |
| `VAPID_PRIVATE_KEY`   | the private key of the same pair, never in the frontend                                                     | the private key of the live pair                                          |
| `VAPID_SUBJECT`       | a contact for the push services, e.g. `mailto:you@example.com`                                              | the team's contact address                                                |

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

| Variable                       | Local                                  | Live                                                                                   |
| ------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FOODSWAP_API_URL` | `http://localhost:3000`                | live backend URL                                                                       |
| `INTERNAL_API_SECRET`          | the same as in `backend/.env`          | the same as on Render; never prefix it with `NEXT_PUBLIC_`                             |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `VAPID_PUBLIC_KEY` from `backend/.env` | the live `VAPID_PUBLIC_KEY` from Render; without it, the web doesn't subscribe to push |

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
| `pnpm dev`                                                       | starts the local database, backend and frontend                                   |
| `pnpm db:up` / `pnpm db:down`                                    | starts / stops the local database (the data is kept)                              |
| `pnpm db:reset`                                                  | deletes the local database and creates it again with the migrations               |
| `pnpm db:reset:mock`                                             | like `db:reset`, plus the mock data                                               |
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

- **Unit tests** check single functions without a database. They live next to the code: `*.spec.ts` in the backend, `*.test.ts` in the frontend and in `shared`, all run with Vitest (the app will use Jest with `jest-expo`, see #236). `pnpm test` runs them, and so does CI.
- **Integration tests** start the backend and send real HTTP requests against a test database. They live in `backend/test/*.integration-spec.ts` and need a database: locally the Docker database, in CI a Postgres service.

`pnpm --filter backend test:integration` runs the backend integration tests against the database in `TEST_DATABASE_URL`. The first run creates it in the local Docker database, and every run applies pending migrations to it. The tests empty the listings, users and chats tables, so `TEST_DATABASE_URL` must never point to your local or the live database; the tests refuse to start if it equals `DATABASE_URL`. The config is `backend/vitest.config.integration.ts`; the test files run one after another because they share the database.

### Updating a feature branch

Before opening a pull request, bring the latest `main` into your branch and check that everything still works:

```bash
pnpm sync:branch
pnpm check
pnpm test
pnpm --filter backend test:integration
git commit
```

`pnpm sync:branch` prepares the merge but does not commit it, so you can check it first (`git merge --abort` undoes it). If it reports `Already up to date.` (nothing new on `main`) or `Fast-forward` (your branch had no own commits and was simply moved forward), there is nothing to commit. If the merge has conflicts, it stops right away: resolve them, run `pnpm install` if `package.json` or `pnpm-lock.yaml` were affected, then `pnpm db:up`, `pnpm --filter backend migration:run`, `pnpm check` and the tests before committing.

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

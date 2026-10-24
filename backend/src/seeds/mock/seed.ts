import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../data-source';
import {
  berlinDay,
  berlinTime,
  endOfDay,
  shiftDay,
} from '../../common/utils/berlin-date';
import { mockChats } from './chats';
import { MockListing, mockListings } from './listings';
import { MOCK_USERNAME_PREFIX, mockUsers } from './users';

// Seeds mock users, listings and chats, or removes them again with --remove.
// Every row gets a fixed id derived from its key, so running the seed twice
// updates the existing rows and the removal only touches seeded rows.

const SALT_ROUNDS = 12;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_END_MONTHS = 6;

type Places = Map<string, string>;
type Lookup = Map<string, string>;

function mockId(kind: string, key: string): string {
  const hex = createHash('sha1')
    .update(`food-swap-mock:${kind}:${key}`)
    .digest('hex');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function endDay(listing: MockListing, now: Date): string {
  if (listing.end === 'today') return berlinDay(now);
  if (listing.end.startsWith('+')) {
    return shiftDay(listing.createdAt.slice(0, 10), {
      days: Number(listing.end.slice(1)),
    });
  }
  return listing.end;
}

function check(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function checkPassword(password: string | undefined): string {
  check(
    password !== undefined && password.length >= 8 && password.length <= 64,
    'Set SEED_PASSWORD to the password of the mock users (8–64 characters).',
  );
  const value = password as string;
  check(
    /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value),
    'SEED_PASSWORD needs an uppercase and a lowercase letter, a number and a special character.',
  );
  return value;
}

async function loadLookups(manager: EntityManager) {
  const placeSlugs = [
    ...new Set([
      ...mockUsers.flatMap((user) => user.place ?? []),
      ...mockListings.map((listing) => listing.place),
    ]),
  ];
  const places = await manager.query<{ id: string; slug: string }[]>(
    `SELECT "id", "slug" FROM "places" WHERE "slug" = ANY($1) AND "postal_code" IS NOT NULL`,
    [placeSlugs],
  );
  const categories = await manager.query<{ id: string; slug: string }[]>(
    `SELECT "id", "slug" FROM "categories"`,
  );
  const tags = await manager.query<{ id: string; slug: string }[]>(
    `SELECT "id", "slug" FROM "tags"`,
  );
  const toMap = (rows: { id: string; slug: string }[]): Lookup =>
    new Map(rows.map((row) => [row.slug, row.id]));

  return {
    places: toMap(places),
    categories: toMap(categories),
    tags: toMap(tags),
  };
}

function validate(
  now: Date,
  places: Places,
  categories: Lookup,
  tags: Lookup,
): void {
  const users = new Map(mockUsers.map((user) => [user.key, user]));
  const listings = new Map(
    mockListings.map((listing) => [listing.key, listing]),
  );

  check(users.size === mockUsers.length, 'Duplicate user key');
  check(listings.size === mockListings.length, 'Duplicate listing key');

  for (const user of mockUsers) {
    const where = `User ${user.key}`;
    check(
      user.username.startsWith(MOCK_USERNAME_PREFIX),
      `${where}: username prefix`,
    );
    check(
      user.username.length >= 5 && user.username.length <= 20,
      `${where}: username must have 5–20 characters`,
    );
    check((user.name?.length ?? 0) <= 100, `${where}: name too long`);
    check(
      !user.place || places.has(user.place),
      `${where}: unknown place ${user.place}`,
    );
    check(berlinTime(user.createdAt) < now, `${where}: created in the future`);
  }

  for (const listing of mockListings) {
    const where = `Listing ${listing.key}`;
    const owner = users.get(listing.owner);
    const createdAt = berlinTime(listing.createdAt);
    const createdDay = listing.createdAt.slice(0, 10);
    const lastDay = endDay(listing, now);
    const endDate = endOfDay(lastDay);

    check(owner !== undefined, `${where}: unknown owner ${listing.owner}`);
    check(
      berlinTime(owner!.createdAt) < createdAt,
      `${where}: created before its owner registered`,
    );
    check(
      listing.title.trim() === listing.title && listing.title.length > 0,
      `${where}: title must be trimmed and not empty`,
    );
    check(listing.title.length <= 100, `${where}: title longer than 100`);
    check(
      listing.description.trim() === listing.description &&
        listing.description.length > 0,
      `${where}: description must be trimmed and not empty`,
    );
    check(listing.description.length <= 2000, `${where}: description too long`);
    check(
      !listing.image ||
        (listing.image.startsWith('https://') && listing.image.length <= 500),
      `${where}: invalid image URL`,
    );
    check(
      places.has(listing.place),
      `${where}: unknown place ${listing.place}`,
    );
    check(categories.has(listing.category), `${where}: unknown category`);
    check(
      new Set(listing.tags).size === listing.tags.length,
      `${where}: duplicate tags`,
    );
    for (const tag of listing.tags) {
      check(tags.has(tag), `${where}: unknown tag ${tag}`);
    }
    check(
      ['active', 'reserved', 'deactivated'].includes(listing.status),
      `${where}: invalid status`,
    );
    check(createdAt < now, `${where}: created in the future`);
    check(
      endDate.getTime() >= createdAt.getTime() + ONE_DAY_IN_MS,
      `${where}: has to last at least one day`,
    );
    check(
      lastDay <= shiftDay(createdDay, { months: MAX_END_MONTHS }),
      `${where}: ends more than ${MAX_END_MONTHS} months after creation`,
    );
  }

  const chatKeys = new Set<string>();
  const participants = new Set<string>();
  for (const chat of mockChats) {
    const where = `Chat ${chat.key}`;
    const listing = listings.get(chat.listing);
    const user = users.get(chat.user);

    check(!chatKeys.has(chat.key), `${where}: duplicate key`);
    chatKeys.add(chat.key);
    check(listing !== undefined, `${where}: unknown listing`);
    check(user !== undefined, `${where}: unknown user`);
    check(
      listing!.owner !== chat.user,
      `${where}: owner cannot chat with themself`,
    );
    check(
      !participants.has(`${chat.listing}:${chat.user}`),
      `${where}: only one chat per listing and user`,
    );
    participants.add(`${chat.listing}:${chat.user}`);
    check(chat.messages.length > 0, `${where}: needs messages`);

    let previous = berlinTime(listing!.createdAt);
    const listingEnd = endOfDay(endDay(listing!, now));
    for (const message of chat.messages) {
      const sentAt = berlinTime(message.at);
      check(
        message.content.trim() === message.content &&
          message.content.length > 0 &&
          message.content.length <= 2000,
        `${where}: invalid message content`,
      );
      check(
        sentAt > previous,
        `${where}: messages out of order at ${message.at}`,
      );
      check(sentAt <= listingEnd, `${where}: message after the listing ended`);
      check(sentAt < now, `${where}: message in the future`);
      previous = sentAt;
    }
    check(
      berlinTime(user!.createdAt) < berlinTime(chat.messages[0].at),
      `${where}: user wrote before registering`,
    );
  }
}

async function seed(): Promise<void> {
  const password = checkPassword(process.env.SEED_PASSWORD);
  const now = new Date();

  await AppDataSource.transaction(async (manager) => {
    const { places, categories, tags } = await loadLookups(manager);
    validate(now, places, categories, tags);

    const userIds = new Map(
      mockUsers.map((user) => [user.key, mockId('user', user.key)]),
    );
    const taken = await manager.query<{ username: string }[]>(
      `SELECT "username" FROM "users" WHERE "username" = ANY($1) AND NOT ("id" = ANY($2))`,
      [mockUsers.map((user) => user.username), [...userIds.values()]],
    );
    check(
      taken.length === 0,
      `Usernames already taken by real users: ${taken.map((row) => row.username).join(', ')}`,
    );

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    for (const user of mockUsers) {
      const createdAt = berlinTime(user.createdAt);
      await manager.query(
        `INSERT INTO "users" ("id", "username", "passwordHash", "name", "place_id", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        ON CONFLICT ("id") DO UPDATE SET "username" = $2, "passwordHash" = $3, "name" = $4, "place_id" = $5, "createdAt" = $6, "updatedAt" = $6`,
        [
          userIds.get(user.key),
          user.username,
          passwordHash,
          user.name,
          user.place ? places.get(user.place) : null,
          createdAt,
        ],
      );
    }

    const listingIds = new Map(
      mockListings.map((listing) => [
        listing.key,
        mockId('listing', listing.key),
      ]),
    );
    for (const listing of mockListings) {
      const createdAt = berlinTime(listing.createdAt);
      const endDate = endOfDay(endDay(listing, now));
      // A status change happened a day after the listing went online.
      const updatedAt =
        listing.status === 'active'
          ? createdAt
          : new Date(
              Math.min(
                createdAt.getTime() + ONE_DAY_IN_MS,
                endDate.getTime(),
                now.getTime(),
              ),
            );

      await manager.query(
        `INSERT INTO "listings" ("id", "title", "description", "image", "type", "status", "ownerId", "category_id", "place_id", "createdAt", "endDate", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT ("id") DO UPDATE SET "title" = $2, "description" = $3, "image" = $4, "type" = $5, "status" = $6, "ownerId" = $7, "category_id" = $8, "place_id" = $9, "createdAt" = $10, "endDate" = $11, "updatedAt" = $12`,
        [
          listingIds.get(listing.key),
          listing.title,
          listing.description,
          listing.image ?? null,
          listing.type,
          listing.status,
          userIds.get(listing.owner),
          categories.get(listing.category),
          places.get(listing.place),
          createdAt,
          endDate,
          updatedAt,
        ],
      );
    }

    await manager.query(
      `DELETE FROM "listing_tags" WHERE "listing_id" = ANY($1)`,
      [[...listingIds.values()]],
    );
    for (const listing of mockListings) {
      for (const tag of listing.tags) {
        await manager.query(
          `INSERT INTO "listing_tags" ("listing_id", "tag_id") VALUES ($1, $2)`,
          [listingIds.get(listing.key), tags.get(tag)],
        );
      }
    }

    const chatIds = mockChats.map((chat) => mockId('chat', chat.key));
    await manager.query(`DELETE FROM "messages" WHERE "chatId" = ANY($1)`, [
      chatIds,
    ]);
    for (const chat of mockChats) {
      const chatId = mockId('chat', chat.key);
      const ownerKey = mockListings.find(
        (listing) => listing.key === chat.listing,
      )!.owner;
      const ownerId = userIds.get(ownerKey);
      const userId = userIds.get(chat.user);
      const sentAt = chat.messages.map((message) => berlinTime(message.at));

      await manager.query(
        `INSERT INTO "chats" ("id", "listingId", "ownerId", "userId", "deletedByOwner", "deletedByUser", "lastMessageAt", "createdAt")
        VALUES ($1, $2, $3, $4, false, false, $5, $6)
        ON CONFLICT ("id") DO UPDATE SET "listingId" = $2, "ownerId" = $3, "userId" = $4, "deletedByOwner" = false, "deletedByUser" = false, "lastMessageAt" = $5, "createdAt" = $6`,
        [
          chatId,
          listingIds.get(chat.listing),
          ownerId,
          userId,
          sentAt.at(-1),
          sentAt[0],
        ],
      );

      for (const [index, message] of chat.messages.entries()) {
        await manager.query(
          `INSERT INTO "messages" ("id", "chatId", "senderId", "content", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
          [
            mockId('message', `${chat.key}:${index}`),
            chatId,
            message.from === 'owner' ? ownerId : userId,
            message.content,
            sentAt[index],
          ],
        );
      }
    }
  });

  console.log(
    `Seeded ${mockUsers.length} users, ${mockListings.length} listings and ${mockChats.length} chats.`,
  );
}

async function remove(): Promise<void> {
  const userIds = mockUsers.map((user) => mockId('user', user.key));
  const chatIds = mockChats.map((chat) => mockId('chat', chat.key));

  const [chats, users] = await AppDataSource.transaction(async (manager) => {
    // Messages cascade with their chat, listings and their tags with their owner.
    const [, deletedChats] = await manager.query<[unknown, number]>(
      `DELETE FROM "chats" WHERE "id" = ANY($1)`,
      [chatIds],
    );
    const [, deletedUsers] = await manager.query<[unknown, number]>(
      `DELETE FROM "users" WHERE "id" = ANY($1)`,
      [userIds],
    );
    return [deletedChats, deletedUsers];
  });

  console.log(
    `Removed ${users} mock users with their listings and ${chats} mock chats.`,
  );
}

async function main(): Promise<void> {
  const shouldRemove = process.argv.includes('--remove');
  const database = new URL(process.env.DATABASE_URL ?? '');

  await AppDataSource.initialize();
  console.log(
    `${shouldRemove ? 'Removing mock data from' : 'Seeding mock data into'} ${database.host}${database.pathname}`,
  );

  try {
    await (shouldRemove ? remove() : seed());
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

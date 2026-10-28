import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, IsNull, Not, Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { Chat } from '../src/chats/entities/chat.entity';
import {
  berlinDay,
  berlinTime,
  endOfDay,
  shiftDay,
} from '../src/common/utils/berlin-date';
import {
  Listing,
  ListingStatus,
  ListingType,
} from '../src/listings/entities/listing.entity';
import { ListingsService } from '../src/listings/listings.service';
import { Place } from '../src/places/entities/place.entity';
import { User } from '../src/users/entities/user.entity';

const END_DAY = '2026-11-20';
const END_DAY_PLUS_28 = '2026-12-18';
const END_DAY_PLUS_29 = '2026-12-19';

const CLEANUP_SECRET = 'test-cleanup-secret';

const runAt = (day: string) => berlinTime(`${day} 03:00`);
const overdueDay = () => shiftDay(berlinDay(new Date()), { days: -29 });

describe('Deleting expired listings (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let listingsService: ListingsService;
  let listings: Repository<Listing>;
  let users: Repository<User>;
  let chats: Repository<Chat>;
  let place: Place;
  let owner: User;

  const createUser = (username: string) =>
    users.save(users.create({ username, passwordHash: 'not-used' }));

  const createListing = (endDay: string, status = ListingStatus.ACTIVE) =>
    listings.save(
      listings.create({
        title: `Ends ${endDay}`,
        description: 'Cleanup test',
        type: ListingType.GIVEAWAY,
        status,
        owner,
        placeId: place.id,
        endDate: endOfDay(endDay),
      }),
    );

  const exists = (listing: Listing) =>
    listings.exists({ where: { id: listing.id } });

  beforeAll(async () => {
    process.env.CLEANUP_SECRET = CLEANUP_SECRET;
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    listingsService = app.get(ListingsService);
    listings = dataSource.getRepository(Listing);
    users = dataSource.getRepository(User);
    chats = dataSource.getRepository(Chat);
    place = await dataSource
      .getRepository(Place)
      .findOneOrFail({ where: { postalCode: Not(IsNull()) } });
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE "messages", "chats", "listings", "users" CASCADE',
    );
    owner = await createUser('owner');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes a listing in the run on end day + 29', async () => {
    const listing = await createListing(END_DAY);

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29), 'daily');

    expect(await exists(listing)).toBe(false);
  });

  it('keeps a listing in the run on end day + 28', async () => {
    const listing = await createListing(END_DAY);

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_28), 'daily');

    expect(await exists(listing)).toBe(true);
  });

  it('keeps a listing until end day + 29 after the change to winter time', async () => {
    const listing = await createListing('2026-10-01');

    await listingsService.deleteExpired(
      berlinTime('2026-10-29 23:30'),
      'daily',
    );

    expect(await exists(listing)).toBe(true);
  });

  it('deletes a listing early on end day + 29 after the change to summer time', async () => {
    const listing = await createListing('2026-03-10');

    await listingsService.deleteExpired(
      berlinTime('2026-04-08 00:30'),
      'daily',
    );

    expect(await exists(listing)).toBe(false);
  });

  it('deletes a deactivated listing on end day + 29', async () => {
    const listing = await createListing(END_DAY, ListingStatus.DEACTIVATED);

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29), 'daily');

    expect(await exists(listing)).toBe(false);
  });

  it('keeps a listing whose end date was extended', async () => {
    const listing = await createListing(END_DAY);
    await listings.update(listing.id, { endDate: endOfDay('2026-12-31') });

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29), 'daily');

    expect(await exists(listing)).toBe(true);
  });

  it('keeps the chats of a deleted listing', async () => {
    const listing = await createListing(END_DAY);
    const user = await createUser('user');
    const chat = await chats.save(
      chats.create({
        listingId: listing.id,
        ownerId: owner.id,
        userId: user.id,
      }),
    );

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29), 'daily');

    const remainingChat = await chats.findOneByOrFail({ id: chat.id });
    expect(remainingChat.listingId).toBeNull();
  });

  it('logs how many listings it deleted', async () => {
    const log = jest.spyOn(Logger.prototype, 'log');
    await createListing(END_DAY);
    await createListing(END_DAY);
    await createListing(END_DAY_PLUS_28);

    const deleted = await listingsService.deleteExpired(
      runAt(END_DAY_PLUS_29),
      'daily',
    );

    expect(deleted).toBe(2);
    expect(log).toHaveBeenCalledWith(
      'ListingCleanup (daily): Deleted 2 expired listings.',
    );
  });

  it('deletes overdue listings when the backend starts', async () => {
    const listing = await createListing(overdueDay());

    await listingsService.onApplicationBootstrap();

    expect(await exists(listing)).toBe(false);
  });

  it('still starts the backend when the startup cleanup fails', async () => {
    jest
      .spyOn(listingsService, 'deleteExpired')
      .mockRejectedValue(new Error('Database unavailable'));
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(listingsService.onApplicationBootstrap()).resolves.toBe(
      undefined,
    );
    expect(logError).toHaveBeenCalledWith(
      'ListingCleanup (startup): Deleting expired listings failed.',
      expect.stringContaining('Database unavailable'),
    );
  });

  describe('POST /listings/cleanup', () => {
    const cleanup = () =>
      request(app.getHttpServer()).post('/listings/cleanup');

    it('deletes overdue listings with the cleanup secret', async () => {
      const log = jest.spyOn(Logger.prototype, 'log');
      const listing = await createListing(overdueDay());

      await cleanup()
        .set('Authorization', `Bearer ${CLEANUP_SECRET}`)
        .expect(200, { deleted: 1 });

      expect(await exists(listing)).toBe(false);
      expect(log).toHaveBeenCalledWith(
        'ListingCleanup (endpoint): Deleted 1 expired listings.',
      );
    });

    it('rejects requests without the cleanup secret', async () => {
      const listing = await createListing(overdueDay());

      await cleanup().expect(401);

      expect(await exists(listing)).toBe(true);
    });

    it('rejects requests with a wrong cleanup secret', async () => {
      const listing = await createListing(overdueDay());

      await cleanup().set('Authorization', 'Bearer wrong-secret').expect(401);

      expect(await exists(listing)).toBe(true);
    });

    it('rejects all requests when no cleanup secret is configured', async () => {
      jest.spyOn(app.get(ConfigService), 'get').mockReturnValue(undefined);
      const listing = await createListing(overdueDay());

      await cleanup()
        .set('Authorization', `Bearer ${CLEANUP_SECRET}`)
        .expect(401);

      expect(await exists(listing)).toBe(true);
    });
  });
});

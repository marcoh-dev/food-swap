import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ListingsService } from '../src/listings/listings.service';
import {
  Listing,
  ListingStatus,
  ListingType,
} from '../src/listings/entities/listing.entity';
import { User } from '../src/users/entities/user.entity';
import { Place } from '../src/places/entities/place.entity';
import { Chat } from '../src/chats/entities/chat.entity';
import { berlinTime, endOfDay } from '../src/common/utils/berlin-date';

const END_DAY = '2026-11-20';
const END_DAY_PLUS_28 = '2026-12-18';
const END_DAY_PLUS_29 = '2026-12-19';

const runAt = (day: string) => berlinTime(`${day} 03:00`);

describe('Deleting expired listings (e2e)', () => {
  let app: INestApplication;
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

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29));

    expect(await exists(listing)).toBe(false);
  });

  it('keeps a listing in the run on end day + 28', async () => {
    const listing = await createListing(END_DAY);

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_28));

    expect(await exists(listing)).toBe(true);
  });

  it('deletes a deactivated listing on end day + 29', async () => {
    const listing = await createListing(END_DAY, ListingStatus.DEACTIVATED);

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29));

    expect(await exists(listing)).toBe(false);
  });

  it('keeps a listing whose end date was extended', async () => {
    const listing = await createListing(END_DAY);
    await listings.update(listing.id, { endDate: endOfDay('2026-12-31') });

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29));

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

    await listingsService.deleteExpired(runAt(END_DAY_PLUS_29));

    const remainingChat = await chats.findOneByOrFail({ id: chat.id });
    expect(remainingChat.listingId).toBeNull();
  });

  it('logs how many listings it deleted', async () => {
    const log = jest.spyOn(Logger.prototype, 'log');
    await createListing(END_DAY);
    await createListing(END_DAY);
    await createListing(END_DAY_PLUS_28);

    const deleted = await listingsService.deleteExpired(runAt(END_DAY_PLUS_29));

    expect(deleted).toBe(2);
    expect(log).toHaveBeenCalledWith('Deleted 2 expired listings.');
  });
});

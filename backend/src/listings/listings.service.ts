import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateListingDto } from './dtos/createListing.dto';
import { Repository } from 'typeorm';
import { Listing, ListingStatus } from './entities/listing.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMetaResponseDto } from '../common/dtos/paginationMetaResponse.dto';
import { User } from '../users/entities/user.entity';
import { UpdateListingDto } from './dtos/updateListing.dto';
import { FindOptionsWhere, ILike, In, MoreThan, Raw } from 'typeorm';
import { ListingsQueryDto } from './dtos/listingsQuery.dto';
import { CategoriesService } from '../categories/category.service';
import { TagsService } from '../tags/tags.service';
import { UpdateListingStatusDto } from './dtos/updateListingStatus.dto';
import { PaginationQueryDto } from '../common/dtos/paginationQuery.dto';
import { PlacesService } from '../places/places.service';
import { Place } from '../places/entities/place.entity';
import {
  berlinDay,
  endOfDay,
  isCalendarDay,
  shiftDay,
} from '../common/utils/berlin-date';

type ListingWithDistance = Listing & { distance?: number };

const LISTING_RELATIONS = {
  owner: true,
  category: true,
  tags: true,
  place: true,
};

const END_DATE_RULES = { defaultDays: 28, minDays: 1, maxMonths: 6 };

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly placesService: PlacesService,
  ) {}

  async findAll(
    query: ListingsQueryDto,
  ): Promise<{ data: ListingWithDistance[]; meta: PaginationMetaResponseDto }> {
    const { page, limit, type, sort, term, place, radius, category, tags } =
      query;
    const visibleStatuses = [ListingStatus.ACTIVE, ListingStatus.RESERVED];

    const baseFilter: FindOptionsWhere<Listing> = {
      status: In(visibleStatuses),
      endDate: MoreThan(new Date()),
    };

    if (type) baseFilter.type = type;
    const selectedPlace = place
      ? await this.placesService.findBySlug(place)
      : null;
    if (selectedPlace) {
      baseFilter.placeId = this.placeFilter(selectedPlace, radius);
    }

    if (category) {
      const foundCategory = await this.categoriesService.findBySlug(category);
      if (foundCategory) {
        baseFilter.categoryId = foundCategory.id;
      }
    }

    if (tags && tags.length > 0) {
      const knowTags = await this.tagsService.findBySlugs(tags);

      if (knowTags.length > 0) {
        const tagIds = knowTags.map((tag) => tag.id);
        const listingIds = await this.fingListingIdsWithAllTags(tagIds);

        if (listingIds.length === 0) {
          return {
            data: [],
            meta: { page, limit, total: 0, totalPages: 0 },
          };
        }
        baseFilter.id = In(listingIds);
      }
    }

    const whereFilter: FindOptionsWhere<Listing>[] = term
      ? [
          { ...baseFilter, title: ILike(`%${term}%`) },
          { ...baseFilter, description: ILike(`%${term}%`) },
        ]
      : [baseFilter];

    const [data, total] =
      sort === 'nearest' && selectedPlace
        ? await this.findNearestPage(whereFilter, selectedPlace, page, limit)
        : await this.listings.findAndCount({
            where: whereFilter,
            order:
              sort === 'endingSoon'
                ? { endDate: 'ASC', createdAt: 'DESC' }
                : { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: LISTING_RELATIONS,
          });

    return {
      data: selectedPlace ? await this.withDistance(data, selectedPlace) : data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findNearestPage(
    where: FindOptionsWhere<Listing>[],
    from: Place,
    page: number,
    limit: number,
  ): Promise<[Listing[], number]> {
    const query = this.listings
      .createQueryBuilder('listing')
      .innerJoin('listing.place', 'place')
      .select('listing.id', 'id')
      .addSelect(
        `ST_Distance("place"."location", (SELECT "location" FROM "places" WHERE "id" = :fromPlaceId))`,
        'distance',
      )
      .where(where)
      .setParameter('fromPlaceId', from.id)
      .orderBy('distance', 'ASC')
      .addOrderBy('listing.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const [rows, total] = await Promise.all([
      query.getRawMany<{ id: string }>(),
      query.getCount(),
    ]);
    const ids = rows.map((row) => row.id);
    const listings = await this.listings.find({
      where: { id: In(ids) },
      relations: LISTING_RELATIONS,
    });
    const listingsById = new Map(
      listings.map((listing) => [listing.id, listing]),
    );

    return [ids.flatMap((id) => listingsById.get(id) ?? []), total];
  }

  private async withDistance(
    listings: Listing[],
    from: Place,
  ): Promise<ListingWithDistance[]> {
    if (listings.length === 0) return listings;

    const rows = await this.listings.query<{ id: string; distance: number }[]>(
      `SELECT "listings"."id", ST_Distance("places"."location", (SELECT "location" FROM "places" WHERE "id" = $1)) / 1000 AS "distance"
      FROM "listings" JOIN "places" ON "places"."id" = "listings"."place_id"
      WHERE "listings"."id" = ANY($2::uuid[])`,
      [from.id, listings.map((listing) => listing.id)],
    );
    const distances = new Map(rows.map((row) => [row.id, row.distance]));

    return listings.map((listing) =>
      Object.assign(listing, { distance: distances.get(listing.id) }),
    );
  }

  private placeFilter(place: Place, radiusKm?: number) {
    const area =
      place.postalCode === null
        ? `"city" = :city AND "county" = :county`
        : `"postal_code" = :postalCode`;
    const nearby = radiusKm
      ? `UNION SELECT "id" FROM "places" WHERE "country_code" = :countryCode AND ST_DWithin("location", (SELECT "location" FROM "places" WHERE "id" = :placeId), :radiusMeters)`
      : '';

    return Raw(
      (alias) =>
        `${alias} IN (SELECT "id" FROM "places" WHERE "country_code" = :countryCode AND ${area} ${nearby})`,
      {
        placeId: place.id,
        countryCode: place.countryCode,
        city: place.city,
        county: place.county,
        postalCode: place.postalCode,
        radiusMeters: (radiusKm ?? 0) * 1000,
      },
    );
  }

  async findAllByUser(
    query: PaginationQueryDto,
    userId: string,
  ): Promise<{ data: Listing[]; meta: PaginationMetaResponseDto }> {
    const { page, limit, type, sort } = query;

    const userExists = await this.users.exists({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const visibleStatuses = [ListingStatus.ACTIVE, ListingStatus.RESERVED];

    const baseFilter: FindOptionsWhere<Listing> = {
      status: In(visibleStatuses),
    };

    if (type) baseFilter.type = type;

    const [data, total] = await this.listings.findAndCount({
      where: { owner: { id: userId } },
      order:
        sort === 'endingSoon'
          ? { endDate: 'ASC', createdAt: 'DESC' }
          : { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        owner: true,
        category: true,
        tags: true,
        place: true,
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.listings.findOne({
      where: { id },
      relations: {
        owner: true,
        category: true,
        tags: true,
        place: true,
      },
    });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found.`);
    }

    return listing;
  }

  async create(listingPayload: CreateListingDto, currentUser: User) {
    const createdAt = new Date();
    const today = berlinDay(createdAt);
    const endDate = this.toEndDate(
      listingPayload.endDate ??
        shiftDay(today, { days: END_DATE_RULES.defaultDays }),
      today,
    );

    if (
      listingPayload.categoryId &&
      !(await this.categoriesService.exists(listingPayload.categoryId))
    ) {
      throw new BadRequestException('Category does not exist.');
    }

    if (
      listingPayload.placeId &&
      !(await this.placesService.existsWithPostalCode(listingPayload.placeId))
    ) {
      throw new BadRequestException(
        'Place does not exist or has no postal code.',
      );
    }

    const tags = listingPayload.tagIds
      ? await this.tagsService.findByIdsOrFail(listingPayload.tagIds)
      : undefined;

    const { endDate: _endDate, ...listingData } = listingPayload;
    const newListing = this.listings.create({
      ...listingData,
      createdAt,
      owner: currentUser,
      endDate,
      tags: tags ?? [],
    });

    return this.listings.save(newListing);
  }

  async update(
    listingId: string,
    listingPayload: UpdateListingDto,
    currentUser: User,
  ) {
    const listing = await this.listings.findOne({
      where: { id: listingId },
      relations: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

    if (listing.owner.id !== currentUser.id) {
      throw new ForbiddenException(
        `You are not allowed to modify this listing.`,
      );
    }

    const endDate = listingPayload.endDate
      ? this.toEndDate(listingPayload.endDate, berlinDay(new Date()))
      : undefined;

    if (
      listingPayload.categoryId &&
      !(await this.categoriesService.exists(listingPayload.categoryId))
    ) {
      throw new BadRequestException('Category does not exist.');
    }

    if (
      listingPayload.placeId &&
      !(await this.placesService.existsWithPostalCode(listingPayload.placeId))
    ) {
      throw new BadRequestException(
        'Place does not exist or has no postal code.',
      );
    }

    const tags = listingPayload.tagIds
      ? await this.tagsService.findByIdsOrFail(listingPayload.tagIds)
      : undefined;

    const {
      tagIds: _tagIds,
      endDate: _endDate,
      ...listingData
    } = listingPayload;

    Object.assign(listing, listingData);
    if (endDate) listing.endDate = endDate;
    if (tags) listing.tags = tags;

    await this.listings.save(listing);
    return this.findOne(listingId);
  }

  async updateStatus(
    listingId: string,
    listingPayload: UpdateListingStatusDto,
    currentUser: User,
  ) {
    const listing = await this.listings.findOne({
      where: { id: listingId },
      relations: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

    if (listing.owner.id !== currentUser.id) {
      throw new ForbiddenException(
        `You are not allowed to modify this listing.`,
      );
    }

    const { status } = listingPayload;

    const allowedTransitions: Record<ListingStatus, ListingStatus[]> = {
      [ListingStatus.PENDING]: [],
      [ListingStatus.ACTIVE]: [
        ListingStatus.RESERVED,
        ListingStatus.DEACTIVATED,
      ],
      [ListingStatus.RESERVED]: [
        ListingStatus.ACTIVE,
        ListingStatus.DEACTIVATED,
      ],
      [ListingStatus.DEACTIVATED]: [ListingStatus.ACTIVE],
    };

    if (!allowedTransitions[listing.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change status from ${listing.status} to ${status}.`,
      );
    }

    listing.status = status;

    return this.listings.save(listing);
  }

  async remove(listingId: string, currentUser: User) {
    const listing = await this.listings.findOne({
      where: { id: listingId },
      relations: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found.`);
    }

    if (listing.owner.id !== currentUser.id) {
      throw new ForbiddenException(
        `You are not allowed to modify this listing.`,
      );
    }

    const result = await this.listings.delete(listingId);

    if ((result.affected ?? 0) < 1) {
      throw new ConflictException(
        `Listing with ID ${listingId} could not be deleted.`,
      );
    }

    return result;
  }
  private async fingListingIdsWithAllTags(tagIds: string[]): Promise<string[]> {
    const rows = await this.listings
      .createQueryBuilder('listing')
      .select('listing.id', 'id')
      .innerJoin('listing.tags', 'tag')
      .where('tag.id IN (:...tagIds)', { tagIds })
      .groupBy('listing.id')
      .having('COUNT(DISTINCT tag.id) = :count', { count: tagIds.length })
      .getRawMany<{ id: string }>();

    return rows.map((row) => row.id);
  }

  // Listings end at 23:59 Berlin time on their last day, which has to be
  // between tomorrow and the maximum duration.
  private toEndDate(day: string, today: string): Date {
    if (!isCalendarDay(day)) {
      throw new BadRequestException('endDate is not a valid date.');
    }

    if (day < shiftDay(today, { days: END_DATE_RULES.minDays })) {
      throw new ConflictException('Listing has to last at least one day.');
    }

    if (day > shiftDay(today, { months: END_DATE_RULES.maxMonths })) {
      throw new ConflictException(
        `Listing cannot last longer than ${END_DATE_RULES.maxMonths} months.`,
      );
    }

    return endOfDay(day);
  }
}

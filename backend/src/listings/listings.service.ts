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
import { FindOptionsWhere, ILike, In } from 'typeorm';
import { ListingsQueryDto } from './dtos/listingsQuery.dto';
import { CategoriesService } from '../categories/category.service';
import { TagsService } from '../tags/tags.service';
import { UpdateListingStatusDto } from './dtos/updateListingStatus.dto';
import { PaginationQueryDto } from '../common/dtos/paginationQuery.dto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const FOUR_WEEKS_IN_MS = 28 * 24 * 60 * 60 * 1000;

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  async findAll(
    query: ListingsQueryDto,
  ): Promise<{ data: Listing[]; meta: PaginationMetaResponseDto }> {
    const { page, limit, type, sort, term, location } = query;
    const visibleStatuses = [ListingStatus.ACTIVE, ListingStatus.RESERVED];

    const baseFilter: FindOptionsWhere<Listing> = {
      status: In(visibleStatuses),
    };

    if (type) baseFilter.type = type;
    if (location) baseFilter.location = ILike(`%${location}%`);

    const whereFilter: FindOptionsWhere<Listing>[] = term
      ? [
          { ...baseFilter, title: ILike(`%${term}%`) },
          { ...baseFilter, description: ILike(`%${term}%`) },
        ]
      : [baseFilter];

    const [data, total] = await this.listings.findAndCount({
      where: whereFilter,
      order: { createdAt: sort === 'oldest' ? 'ASC' : 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        owner: true,
        category: true,
        tags: true,
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
      order: { createdAt: sort === 'oldest' ? 'ASC' : 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        owner: true,
        category: true,
        tags: true,
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
      },
    });
    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found.`);
    }

    return listing;
  }

  async create(listingPayload: CreateListingDto, currentUser: User) {
    const createdAt = new Date();
    const endDate =
      listingPayload.endDate ??
      new Date(createdAt.getTime() + FOUR_WEEKS_IN_MS);

    if (
      listingPayload.categoryId &&
      !(await this.categoriesService.exists(listingPayload.categoryId))
    ) {
      throw new BadRequestException('Category does not exist.');
    }

    if (endDate.getTime() < createdAt.getTime()) {
      throw new ConflictException('Listing end cannot be in the past.');
    }

    if (endDate.getTime() < createdAt.getTime() + ONE_DAY_IN_MS) {
      throw new ConflictException('Listing has to last at least one day.');
    }
    const tags = listingPayload.tagIds
      ? await this.tagsService.findByIdsOrFail(listingPayload.tagIds)
      : undefined;

    const newListing = this.listings.create({
      ...listingPayload,
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

    const { endDate } = listingPayload;

    if (endDate) {
      const now = new Date();

      if (endDate.getTime() < now.getTime()) {
        throw new ConflictException('Listing end cannot be in the past.');
      }

      if (endDate.getTime() < now.getTime() + ONE_DAY_IN_MS) {
        throw new ConflictException('Listing has to last at least one day.');
      }
    }

    if (
      listingPayload.categoryId &&
      !(await this.categoriesService.exists(listingPayload.categoryId))
    ) {
      throw new BadRequestException('Category does not exist.');
    }

    const tags = listingPayload.tagIds
      ? await this.tagsService.findByIdsOrFail(listingPayload.tagIds)
      : undefined;

    const { tagIds: _tagIds, ...listingData } = listingPayload;

    Object.assign(listing, listingData);
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
}

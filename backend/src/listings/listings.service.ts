import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateListingDto } from './dtos/createListing.dto';
import { Repository } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dtos/paginationQuery.dto';
import { PaginationMetaResponseDto } from '../common/dtos/paginationMetaResponse.dto';
import { User } from '../users/entities/user.entity';
import { UpdateListingDto } from './dtos/updateListing.dto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const FOUR_WEEKS_IN_MS = 28 * 24 * 60 * 60 * 1000;

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
  ) {}

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<{ data: Listing[]; meta: PaginationMetaResponseDto }> {
    const { page, limit, type } = pagination;

    let whereFilter = {};

    if (type) {
      whereFilter = { ...whereFilter, type };
    }

    const [data, total] = await this.listings.findAndCount({
      where: whereFilter,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        owner: true,
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

    if (endDate.getTime() < createdAt.getTime()) {
      throw new ConflictException('Listing end cannot be in the past.');
    }

    if (endDate.getTime() < createdAt.getTime() + ONE_DAY_IN_MS) {
      throw new ConflictException('Listing has to last at least one day.');
    }

    const newListing = this.listings.create({
      ...listingPayload,
      createdAt,
      owner: currentUser,
      endDate,
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

    Object.assign(listing, listingPayload);

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

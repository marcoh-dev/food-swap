import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  SerializeOptions,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dtos/createListing.dto';
import { ListingResponseDto } from './dtos/listingResponse.dto';
import { PaginationQueryDto } from '../common/dtos/paginationQuery.dto';
import { PaginatedListingsResponseDto } from './dtos/paginatedListingsResponse.dto';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../auth/login.type';
import { UpdateListingDto } from './dtos/updateListing.dto';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Public()
  @Get()
  @SerializeOptions({ type: PaginatedListingsResponseDto })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.listingsService.findAll(pagination);
  }

  @Public()
  @Get(':id')
  @SerializeOptions({ type: ListingResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
  @SerializeOptions({ type: ListingResponseDto })
  create(
    @Body() listingPayload: CreateListingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.create(listingPayload, req.user);
  }

  @Patch(':id')
  @SerializeOptions({ type: ListingResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() listingPayload: UpdateListingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.update(id, listingPayload, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.remove(id, req.user);
  }
}

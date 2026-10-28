import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';

import { CleanupSecretGuard } from './cleanupSecret.guard';
import { CreateListingDto } from './dtos/createListing.dto';
import { ListingResponseDto } from './dtos/listingResponse.dto';
import { ListingsQueryDto } from './dtos/listingsQuery.dto';
import { PaginatedListingsResponseDto } from './dtos/paginatedListingsResponse.dto';
import { ListingsService } from './listings.service';
import type { AuthenticatedRequest } from '../auth/login.types';
import { UpdateListingDto } from './dtos/updateListing.dto';
import { UpdateListingStatusDto } from './dtos/updateListingStatus.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Public()
  @Get()
  @SerializeOptions({ type: PaginatedListingsResponseDto })
  findAll(@Query() query: ListingsQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @SerializeOptions({ type: ListingResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.findOne(id);
  }

  @Public()
  @UseGuards(CleanupSecretGuard)
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanup() {
    const deleted = await this.listingsService.deleteExpired(
      new Date(),
      'endpoint',
    );
    return { deleted };
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

  @Patch(':id/status')
  @SerializeOptions({ type: ListingResponseDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() listingPayload: UpdateListingStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.updateStatus(id, listingPayload, req.user);
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

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
  Query,
  Request,
  SerializeOptions,
} from '@nestjs/common';

import { UserResponseDto } from './dtos/userResponse.dto';
import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../auth/login.types';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dtos/paginationQuery.dto';
import { PaginatedListingsResponseDto } from '../listings/dtos/paginatedListingsResponse.dto';
import { ListingsService } from '../listings/listings.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly listingsService: ListingsService,
  ) {}

  @Public()
  @Get(':id')
  @SerializeOptions({ type: UserResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Public()
  @Get(':id/listings')
  @SerializeOptions({ type: PaginatedListingsResponseDto })
  findAllListingsByUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.listingsService.findAllByUser(query, userId);
  }

  @Patch(':id')
  @SerializeOptions({ type: UserResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() userPayload: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(id, userPayload, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.remove(id, req.user);
  }
}

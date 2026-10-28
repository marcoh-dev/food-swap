import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';

import { NearestPlaceDto } from './dtos/nearestPlace.dto';
import { PlaceResponseDto } from './dtos/placeResponse.dto';
import { PlacesQueryDto } from './dtos/placesQuery.dto';
import { PlacesService } from './places.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Public()
  @Get()
  @SerializeOptions({ type: PlaceResponseDto })
  search(@Query() { q, withPostalCode }: PlacesQueryDto) {
    return this.placesService.search(q, withPostalCode ?? false);
  }

  @Public()
  @Post('nearest')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: PlaceResponseDto })
  findNearest(@Body() { lat, lng }: NearestPlaceDto) {
    return this.placesService.findNearest(lat, lng);
  }

  @Public()
  @Get(':slug')
  @SerializeOptions({ type: PlaceResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }
}

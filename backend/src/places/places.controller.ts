import {
  Controller,
  Get,
  Param,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PlacesService } from './places.service';
import { PlacesQueryDto } from './dtos/placesQuery.dto';
import { PlaceResponseDto } from './dtos/placeResponse.dto';

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
  @Get(':slug')
  @SerializeOptions({ type: PlaceResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }
}

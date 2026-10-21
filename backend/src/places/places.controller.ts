import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
  @Get(':id')
  @SerializeOptions({ type: PlaceResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.findOne(id);
  }
}

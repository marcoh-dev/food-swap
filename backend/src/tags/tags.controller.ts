import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { TagsService } from './tags.service';
import { TagResponseDto } from './dtos/tagResponse.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @SerializeOptions({ type: TagResponseDto })
  findAll() {
    return this.tagsService.findAll();
  }
}

import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { CategoriesService } from './category.service';
import { CategoryResponseDto } from './dtos/categoryResponse.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @SerializeOptions({ type: CategoryResponseDto })
  findAll() {
    return this.categoriesService.findAll();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryResponseDto } from './dtos/categoryResponse.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  async exists(id: string): Promise<boolean> {
    return this.categories.exists({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.categories.findOneBy({ slug });
  }
}

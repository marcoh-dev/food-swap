import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './dtos/categoryResponse.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categories.find({ order: { name: 'ASC' } });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tags: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tags.find({ order: { name: 'ASC' } });
  }

  async findByIdsOrFail(ids: string[]): Promise<Tag[]> {
    const tags = await this.tags.findBy({ id: In(ids) });
    if (ids.length === 0) return [];
    if (tags.length !== ids.length) {
      throw new BadRequestException('One or more tags do not exist.');
    }
    return tags;
  }

  async findBySlugs(slugs: string[]): Promise<Tag[]> {
    if (slugs.length === 0) {
      return [];
    }
    return this.tags.findBy({ slug: In(slugs) });
  }
}

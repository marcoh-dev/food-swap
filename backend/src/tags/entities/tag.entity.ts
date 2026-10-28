import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Listing } from '../../listings/entities/listing.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @ManyToMany(() => Listing, (listing) => listing.tags)
  listings!: Listing[];
}

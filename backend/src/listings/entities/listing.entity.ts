import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Category } from '../../categories/entities/category.entity';

export enum ListingType {
  SWAP = 'swap',
  GIVEAWAY = 'giveaway',
}

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  @Column()
  location!: string;

  @Column({
    type: 'enum',
    enum: ListingType,
  })
  type!: ListingType;

  @ManyToOne(() => User, (user) => user.listings)
  owner!: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => Category, (category) => category.listings, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @ManyToMany(() => Tag, (tag) => tag.listings)
  @JoinTable({
    name: 'listing_tags',
    joinColumn: { name: 'listing_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

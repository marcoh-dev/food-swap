import {
  Column,
  Entity,
  Index,
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
import { Place } from '../../places/entities/place.entity';

export enum ListingType {
  SWAP = 'swap',
  GIVEAWAY = 'giveaway',
}

export enum ListingStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  RESERVED = 'reserved',
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

  @Index('IDX_listings_place_id')
  @Column({ name: 'place_id' })
  placeId!: string;

  @ManyToOne(() => Place, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'place_id',
    foreignKeyConstraintName: 'FK_listings_place_id',
  })
  place!: Place;

  @Column({
    type: 'enum',
    enum: ListingType,
  })
  type!: ListingType;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status!: ListingStatus;

  @ManyToOne(() => User, (user) => user.listings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
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

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  endDate!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

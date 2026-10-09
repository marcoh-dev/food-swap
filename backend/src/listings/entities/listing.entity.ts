import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

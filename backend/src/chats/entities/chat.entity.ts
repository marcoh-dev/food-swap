import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Message } from './message.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chats')
@Unique('UQ_chats_listing_owner_user', ['listingId', 'ownerId', 'userId'])
@Check('CHK_chats_not_self', '"ownerId" <> "userId"')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  listingId!: string | null;

  @ManyToOne(() => Listing, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner!: User | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'boolean', default: false })
  deletedByOwner!: boolean;

  @Column({ type: 'boolean', default: false })
  deletedByUser!: boolean;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  lastMessageAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ownerLastReadAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  userLastReadAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages!: Message[];
}

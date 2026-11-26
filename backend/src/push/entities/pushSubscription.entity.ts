import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "../../users/entities/user.entity";

export enum PushSubscriptionType {
	WEB = "web",
	EXPO = "expo",
}

/**
 * One device that gets chat pushes for a user. Renewed on each visit (`lastSeenAt`); deleted on
 * logout, "Überall abmelden", when the push service rejects it, or when not renewed for a while.
 */
@Entity("push_subscriptions")
export class PushSubscription {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "uuid" })
	userId!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User;

	@Column({ type: "enum", enum: PushSubscriptionType })
	type!: PushSubscriptionType;

	/** The browser's push endpoint URL, or the Expo push token. */
	@Index({ unique: true })
	@Column({ type: "text" })
	endpoint!: string;

	/** Web push only: the browser's keys to encrypt the message for it. */
	@Column({ type: "varchar", length: 255, nullable: true })
	p256dh!: string | null;

	@Column({ type: "varchar", length: 255, nullable: true })
	auth!: string | null;

	@Column({ type: "timestamptz", default: () => "now()" })
	lastSeenAt!: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;
}

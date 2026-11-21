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

/** A refresh token of a user; only its SHA-256 hash is stored, so a database leak doesn't reveal it. */
@Entity("refresh_tokens")
export class RefreshToken {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "uuid" })
	userId!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User;

	@Index({ unique: true })
	@Column({ type: "varchar", length: 64 })
	tokenHash!: string;

	@Column({ type: "timestamptz" })
	expiresAt!: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;
}

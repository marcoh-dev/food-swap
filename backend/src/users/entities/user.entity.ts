import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Listing } from "../../listings/entities/listing.entity";
import { Place } from "../../places/entities/place.entity";

@Entity("users")
// Created by a migration (lower() can't be expressed here); synchronize: false keeps TypeORM from dropping it
@Index("IDX_users_username_lower", { synchronize: false })
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ unique: true })
	username!: string;

	@Column()
	passwordHash!: string;

	@Column({ type: "varchar", nullable: true })
	name!: string | null;

	@Column({ name: "place_id", type: "uuid", nullable: true })
	placeId!: string | null;

	@ManyToOne(() => Place, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({
		name: "place_id",
		foreignKeyConstraintName: "FK_users_place_id",
	})
	place!: Place | null;

	@OneToMany(() => Listing, (listing) => listing.owner)
	listings!: Listing[];

	/** Access tokens issued before this moment are rejected ("log out everywhere"). */
	@Column({ type: "timestamptz", nullable: true })
	loggedOutEverywhereAt!: Date | null;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;
}

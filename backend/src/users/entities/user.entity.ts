import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Listing } from "../../listings/entities/listing.entity";
import { Place } from "../../places/entities/place.entity";

@Entity("users")
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

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;
}

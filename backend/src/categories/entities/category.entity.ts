import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Listing } from "../../listings/entities/listing.entity";

@Entity("categories")
export class Category {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ unique: true })
	slug!: string;

	@Column()
	name!: string;

	@OneToMany(() => Listing, (listing) => listing.category)
	listings!: Listing[];
}

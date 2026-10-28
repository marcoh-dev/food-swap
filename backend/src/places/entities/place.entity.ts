import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import type { Point } from "typeorm";

@Entity("places")
@Index("IDX_places_name_trgm", { synchronize: false })
@Index("IDX_places_alt_name_trgm", { synchronize: false })
@Index("IDX_places_district_trgm", { synchronize: false })
@Index("IDX_places_postal_code", { synchronize: false })
@Index("IDX_places_location", { synchronize: false })
@Index("IDX_places_area", ["countryCode", "city", "county"])
export class Place {
	@PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_places_id" })
	id!: string;

	@Column({ name: "country_code", type: "char", length: 2 })
	countryCode!: string;

	@Column({ name: "postal_code", type: "varchar", length: 10, nullable: true })
	postalCode!: string | null;

	@Column()
	name!: string;

	@Index("IDX_places_slug", { unique: true })
	@Column()
	slug!: string;

	@Column()
	city!: string;

	@Column()
	county!: string;

	@Column()
	state!: string;

	@Column({
		type: "geography",
		spatialFeatureType: "Point",
		srid: 4326,
		select: false,
	})
	location!: Point;

	@Column({ type: "integer" })
	size!: number;
}

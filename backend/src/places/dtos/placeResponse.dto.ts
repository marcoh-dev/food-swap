import { Expose } from "class-transformer";

export class PlaceResponseDto {
	@Expose()
	id!: string;

	@Expose()
	countryCode!: string;

	@Expose()
	postalCode!: string | null;

	@Expose()
	name!: string;

	@Expose()
	slug!: string;

	@Expose()
	city!: string;

	@Expose()
	county!: string;

	@Expose()
	state!: string;
}

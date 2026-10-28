import { Expose, Type } from "class-transformer";

import { CategoryResponseDto } from "../../categories/dtos/categoryResponse.dto";
import { PlaceResponseDto } from "../../places/dtos/placeResponse.dto";
import { TagResponseDto } from "../../tags/dtos/tagResponse.dto";
import { UserResponseDto } from "../../users/dtos/userResponse.dto";
import { ListingStatus, ListingType } from "../entities/listing.entity";

export class ListingResponseDto {
	@Expose()
	id!: string;

	@Expose()
	title!: string;

	@Expose()
	description!: string;

	@Expose()
	image!: string | null;

	@Expose()
	@Type(() => PlaceResponseDto)
	place!: PlaceResponseDto;

	@Expose()
	distance?: number;

	@Expose()
	type!: ListingType;

	@Expose()
	status!: ListingStatus;

	@Expose()
	@Type(() => UserResponseDto)
	owner!: UserResponseDto;

	@Expose()
	@Type(() => CategoryResponseDto)
	category!: CategoryResponseDto | null;

	@Expose()
	@Type(() => TagResponseDto)
	tags!: TagResponseDto[];

	@Expose()
	@Type(() => Date)
	createdAt!: Date;

	@Expose()
	@Type(() => Date)
	endDate!: Date;
}

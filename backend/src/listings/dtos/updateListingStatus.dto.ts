import { IsIn } from 'class-validator';

import { ListingStatus } from '../entities/listing.entity';

export class UpdateListingStatusDto {
  @IsIn([
    ListingStatus.ACTIVE,
    ListingStatus.RESERVED,
    ListingStatus.DEACTIVATED,
  ])
  status!: ListingStatus;
}

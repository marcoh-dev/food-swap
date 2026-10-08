import { PartialType } from '@nestjs/mapped-types';
import { CreateListingDto } from './createListing.dto';

export class UpdateListingDto extends PartialType(CreateListingDto) {}

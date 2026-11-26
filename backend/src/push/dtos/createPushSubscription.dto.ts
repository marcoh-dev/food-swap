import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString, IsUrl, MaxLength, ValidateNested } from "class-validator";

import { PushSubscriptionType } from "../entities/pushSubscription.entity";

/** The browser's keys of a web push subscription (`PushSubscription.toJSON().keys`). */
export class PushKeysDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	p256dh!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	auth!: string;
}

/** A browser's push subscription; Expo push tokens from the app follow with #176. */
export class CreatePushSubscriptionDto {
	@IsIn([PushSubscriptionType.WEB])
	type!: PushSubscriptionType.WEB;

	// Push services only use HTTPS
	@IsUrl({ protocols: ["https"], require_protocol: true })
	@MaxLength(2000)
	endpoint!: string;

	@ValidateNested()
	@Type(() => PushKeysDto)
	keys!: PushKeysDto;
}

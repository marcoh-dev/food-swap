import { Type } from "class-transformer";
import {
	IsDefined,
	IsEnum,
	IsNotEmpty,
	IsString,
	isURL,
	MaxLength,
	Validate,
	ValidateIf,
	ValidateNested,
	type ValidationArguments,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from "class-validator";
import { Expo } from "expo-server-sdk";

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

/**
 * The endpoint for the subscription's type: for `web` the browser's push service URL (always
 * HTTPS), for `expo` an Expo push token like `ExponentPushToken[…]` (checked with Expo's own rule).
 */
@ValidatorConstraint({ name: "isPushEndpoint" })
class IsPushEndpointConstraint implements ValidatorConstraintInterface {
	validate(value: unknown, args: ValidationArguments): boolean {
		if (typeof value !== "string") return false;

		const { type } = args.object as CreatePushSubscriptionDto;
		if (type === PushSubscriptionType.EXPO) return Expo.isExpoPushToken(value);
		return isURL(value, { protocols: ["https"], require_protocol: true });
	}

	defaultMessage(args: ValidationArguments): string {
		const { type } = args.object as CreatePushSubscriptionDto;
		return type === PushSubscriptionType.EXPO
			? "endpoint must be an Expo push token"
			: "endpoint must be an HTTPS URL";
	}
}

/**
 * A device's push subscription: a browser's (`web`, endpoint at its push service plus keys) or
 * the app's (`expo`, the Expo push token as the endpoint, no keys).
 */
export class CreatePushSubscriptionDto {
	@IsEnum(PushSubscriptionType)
	type!: PushSubscriptionType;

	@Validate(IsPushEndpointConstraint)
	@MaxLength(2000)
	endpoint!: string;

	// Only browsers have keys; the app's pushes are encrypted by Expo and Firebase
	@ValidateIf(
		(subscription: CreatePushSubscriptionDto) => subscription.type === PushSubscriptionType.WEB,
	)
	@IsDefined()
	@ValidateNested()
	@Type(() => PushKeysDto)
	keys?: PushKeysDto;
}

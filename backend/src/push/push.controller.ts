import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Request } from "@nestjs/common";

import { CreatePushSubscriptionDto } from "./dtos/createPushSubscription.dto";
import { DeletePushSubscriptionDto } from "./dtos/deletePushSubscription.dto";
import { PushService } from "./push.service";
import type { AuthenticatedRequest } from "../auth/login.types";

@Controller("push-subscriptions")
export class PushController {
	constructor(private readonly pushService: PushService) {}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	save(@Body() subscription: CreatePushSubscriptionDto, @Request() req: AuthenticatedRequest) {
		return this.pushService.save(req.user.id, subscription);
	}

	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Body() { endpoint }: DeletePushSubscriptionDto, @Request() req: AuthenticatedRequest) {
		return this.pushService.remove(req.user.id, endpoint);
	}
}

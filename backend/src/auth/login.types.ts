import { Request } from "express";

import { User } from "../users/entities/user.entity";

export type Payload = {
	sub: string;
	/** Set on socket tickets, which must not work as access tokens. */
	purpose?: "socket";
};

export type AuthenticatedRequest = Request & {
	user: User;
};

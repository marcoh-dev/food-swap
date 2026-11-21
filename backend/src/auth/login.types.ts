import { Request } from "express";

import { User } from "../users/entities/user.entity";

export type Payload = {
	sub: string;
	/** Set on socket tickets, which must not work as access tokens. */
	purpose?: "socket";
	/** When the token was issued, in seconds (set by the JWT library). */
	iat?: number;
};

export type AuthenticatedRequest = Request & {
	user: User;
};

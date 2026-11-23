import type { ServerToClientEvents } from "@food-swap/shared/types";
import { io, type Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents> = io(process.env.NEXT_PUBLIC_FOODSWAP_API_URL, {
	autoConnect: false,
});

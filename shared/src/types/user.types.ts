import type { Place } from "./place.types";

export type UserCredentials = {
	username: string;
	password: string;
};

export type User = {
	id: string;
	username: string;
	name: string | null;
	createdAt: string;
	place?: Place | null;
};

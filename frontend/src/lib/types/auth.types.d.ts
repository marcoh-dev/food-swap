export type AuthResponse = {
	access_token: string;
	statusCode?: number;
	message?: string;
};

export type RegistrationResponse = {
	username: string;
	id: string;
	statusCode?: number;
	message?: string;
};
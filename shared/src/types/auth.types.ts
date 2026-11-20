export type AuthResponse = {
	access_token: string;
	refresh_token: string;
	statusCode?: number;
	message?: string;
};

export type RegistrationResponse = {
	access_token?: string;
	refresh_token?: string;
	statusCode?: number;
	message?: string;
};

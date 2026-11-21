import type { AuthResponse } from "@food-swap/shared/types";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export type AuthTokens = Pick<AuthResponse, "access_token" | "refresh_token">;

export function getToken() {
	return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
	return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveTokens({ access_token, refresh_token }: AuthTokens) {
	await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
	await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
}

export async function deleteTokens() {
	await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
	await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

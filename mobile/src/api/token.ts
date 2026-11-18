import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "access_token";

export function getToken() {
	return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveToken(token: string) {
	return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function deleteToken() {
	return SecureStore.deleteItemAsync(TOKEN_KEY);
}

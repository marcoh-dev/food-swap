import { post } from "@/api/request";
import type { LoginValues } from "@/lib/schemas/user.schemas";

type LoginResponse = { access_token: string };

export function login(values: LoginValues) {
	return post<LoginResponse>("/auth/login", values);
}

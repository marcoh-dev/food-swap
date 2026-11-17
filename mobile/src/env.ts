import { z } from "zod";

const envSchema = z.object({
	EXPO_PUBLIC_API_URL: z.url({ protocol: /^https?$/ }),
});

const result = envSchema.safeParse({
	EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

export const envError = result.success ? null : z.prettifyError(result.error);

export function getEnv() {
	if (!result.success) {
		throw new Error(
			`Invalid environment variables in .env.local:\n${z.prettifyError(result.error)}`,
		);
	}

	return result.data;
}

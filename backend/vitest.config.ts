import { defineConfig } from "vitest/config";

// Unit tests next to the code; the integration tests against the test database have their own
// config (vitest.config.integration.ts)
export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.spec.ts"],
	},
});

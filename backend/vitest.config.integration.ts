import { defineConfig } from "vitest/config";

// Integration tests against the test database (TEST_DATABASE_URL): the global setup creates it
// and runs the migrations, the setup file points the app at it
export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["test/**/*.integration-spec.ts"],
		globalSetup: ["test/setup/global-setup.ts"],
		setupFiles: ["test/setup/test-env.ts"],
		// One file at a time: the tests share the test database
		fileParallelism: false,
	},
});

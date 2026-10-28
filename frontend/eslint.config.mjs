import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	{
		rules: {
			"import/order": [
				"error",
				{
					groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
					pathGroups: [{ pattern: "@/**", group: "internal" }],
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
					named: true,
				},
			],
			"import/no-duplicates": "error",
		},
	},
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

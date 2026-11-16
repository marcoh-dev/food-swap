const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettier = require("eslint-config-prettier/flat");

module.exports = defineConfig([
	expoConfig,
	prettier,
	{
		languageOptions: { parserOptions: { jsxPragma: null } },
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
			"react/jsx-uses-react": "off",
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ vars: "all", args: "none", ignoreRestSiblings: true, caughtErrors: "all" },
			],
			"no-restricted-imports": [
				"error",
				{ patterns: [{ regex: "(^|/)\\.\\./", message: 'Use "@/…" instead of "../".' }] },
			],
		},
	},
	globalIgnores([".expo/**", "dist/**", "web-build/**", "ios/**", "android/**", "expo-env.d.ts"]),
]);

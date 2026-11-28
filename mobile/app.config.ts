import type { ExpoConfig } from "expo/config";

// The EAS project under the Expo organization "food-swap" (created with `eas init`)
const EAS_PROJECT_ID = "84d9576c-2448-4203-b493-eb74284527e9";

const config: ExpoConfig = {
	name: "FoodSwap",
	slug: "food-swap",
	owner: "food-swap",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./assets/images/icon.png",
	scheme: "foodswap",
	userInterfaceStyle: "automatic",
	ios: {
		icon: "./assets/expo.icon",
		bundleIdentifier: "dev.marcoh.foodswap",
	},
	android: {
		adaptiveIcon: {
			// The light theme's background (shared/theme.css), like the web icons
			backgroundColor: "#f7f3eb",
			foregroundImage: "./assets/images/android-icon-foreground.png",
			backgroundImage: "./assets/images/android-icon-background.png",
			monochromeImage: "./assets/images/android-icon-monochrome.png",
		},
		predictiveBackGestureEnabled: false,
		package: "dev.marcoh.foodswap",
		// Links the app to the Firebase project for push (FCM). Not in the repo (it's public): EAS
		// builds get it from the file variable GOOGLE_SERVICES_JSON, local builds read the
		// git-ignored copy next to this file
		googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
	},
	web: {
		favicon: "./assets/images/favicon.png",
	},
	plugins: [
		"expo-router",
		[
			"expo-splash-screen",
			{
				backgroundColor: "#f7f3eb",
				image: "./assets/images/android-icon-foreground.png",
				imageWidth: 300,
			},
		],
		"expo-secure-store",
		[
			"expo-notifications",
			{
				// White silhouette for the status bar, tinted with the accent colour (shared/theme.css)
				icon: "./assets/images/notification-icon.png",
				color: "#ad242f",
				// The channel the backend sends to (CHAT_CHANNEL_ID)
				defaultChannel: "chat-messages",
			},
		],
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
	extra: {
		eas: { projectId: EAS_PROJECT_ID },
	},
};

export default config;

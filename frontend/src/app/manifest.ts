import type { MetadataRoute } from "next";

// The light theme's background (shared/theme.css), which the icons use as well
const BACKGROUND = "#f7f3eb";

/**
 * The web app manifest (/manifest.webmanifest): lets browsers add FoodSwap to the home screen
 * like an app. iPhones and iPads only get web push this way.
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "FoodSwap",
		short_name: "FoodSwap",
		description: "Tausche oder verschenke Lebensmittel in deiner Nähe.",
		start_url: "/",
		display: "standalone",
		background_color: BACKGROUND,
		theme_color: BACKGROUND,
		icons: [
			{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
			// The icon has enough margin for Android to crop it into a circle or squircle
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
	};
}

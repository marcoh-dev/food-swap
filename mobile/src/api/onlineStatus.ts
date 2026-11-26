import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState } from "react-native";

/**
 * Tells TanStack Query whether the device is online, so it pauses requests offline and resumes
 * them afterwards. The network state is also checked again whenever the app comes back to the
 * foreground: events from while the app was in the background (e.g. the screen was locked and
 * Wi-Fi came back) don't arrive, and the app would otherwise stay "offline".
 */
export function syncOnlineStatus() {
	onlineManager.setEventListener((setOnline) => {
		let initialized = false;

		function checkNow() {
			Network.getNetworkStateAsync()
				.then((state) => setOnline(!!state.isConnected))
				.catch(() => {});
		}

		const networkSubscription = Network.addNetworkStateListener((state) => {
			initialized = true;
			setOnline(!!state.isConnected);
		});

		const appStateSubscription = AppState.addEventListener("change", (status) => {
			if (status === "active") checkNow();
		});

		Network.getNetworkStateAsync()
			.then((state) => {
				if (!initialized) {
					setOnline(!!state.isConnected);
				}
			})
			.catch(() => {});

		return () => {
			networkSubscription.remove();
			appStateSubscription.remove();
		};
	});
}

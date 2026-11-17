import { focusManager } from "@tanstack/react-query";
import { AppState } from "react-native";

export function syncAppFocus() {
	focusManager.setEventListener((setFocused) => {
		const subscription = AppState.addEventListener("change", (status) => {
			setFocused(status === "active");
		});

		return () => subscription.remove();
	});
}

import { focusManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

/** Whether the app is in the foreground (`focusManager` follows the app state, see appFocus.ts). */
export function useIsAppActive() {
	return useSyncExternalStore(
		(onChange) => focusManager.subscribe(onChange),
		() => focusManager.isFocused(),
	);
}

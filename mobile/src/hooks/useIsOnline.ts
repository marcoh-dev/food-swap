import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

export function useIsOnline() {
	return useSyncExternalStore(
		(onChange) => onlineManager.subscribe(onChange),
		() => onlineManager.isOnline(),
	);
}

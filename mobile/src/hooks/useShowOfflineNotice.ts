import { useEffect, useState } from "react";

import { useIsOnline } from "@/hooks/useIsOnline";

// Brief losses of the connection (e.g. right after unlocking the screen) don't show the notice
const SHOW_AFTER_MS = 500;

/**
 * Whether to show the offline notice: after half a second without a connection, so short gaps don't
 * flash it. Buttons and requests use `useIsOnline`, which reacts right away.
 */
export function useShowOfflineNotice() {
	const isOnline = useIsOnline();
	const [offlineLongEnough, setOfflineLongEnough] = useState(false);

	// Back online: the next time offline starts the wait again
	if (isOnline && offlineLongEnough) {
		setOfflineLongEnough(false);
	}

	useEffect(() => {
		if (isOnline) return;

		const timer = setTimeout(() => setOfflineLongEnough(true), SHOW_AFTER_MS);
		return () => clearTimeout(timer);
	}, [isOnline]);

	return !isOnline && offlineLongEnough;
}

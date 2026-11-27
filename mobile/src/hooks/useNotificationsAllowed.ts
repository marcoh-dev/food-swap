import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { notificationsAllowed, registerForPush } from "@/lib/pushNotifications";

const NOTIFICATIONS_ALLOWED_QUERY_KEY = ["notifications", "allowed"];

/**
 * Whether notifications are allowed (undefined while loading), checked again each time the app
 * comes back to the foreground, e.g. from the system settings. When they were turned on meanwhile,
 * this device's push token is saved.
 */
export function useNotificationsAllowed() {
	const { data: allowed, refetch } = useQuery({
		queryKey: NOTIFICATIONS_ALLOWED_QUERY_KEY,
		queryFn: notificationsAllowed,
		// The user can change it outside the app at any time
		staleTime: 0,
	});
	const wasAllowed = useRef(allowed);

	useEffect(() => {
		if (allowed && wasAllowed.current === false) void registerForPush();
		wasAllowed.current = allowed;
	}, [allowed]);

	return { allowed, refresh: refetch };
}

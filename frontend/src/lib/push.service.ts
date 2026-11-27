import { fetchAPI } from "./fetchAPI";

/** A browser's push subscription as the backend stores it (`PushSubscription.toJSON()`). */
export type WebPushSubscription = {
	endpoint: string;
	keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(subscription: WebPushSubscription): Promise<void> {
	const response = await fetchAPI(
		process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/push-subscriptions",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type: "web", ...subscription }),
		},
	);
	if (!response.ok) throw new Error(`Saving the push subscription failed: ${response.status}`);
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
	const response = await fetchAPI(
		process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/push-subscriptions",
		{
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ endpoint }),
		},
	);
	if (!response.ok) throw new Error(`Deleting the push subscription failed: ${response.status}`);
}

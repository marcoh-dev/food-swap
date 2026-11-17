export const HOME_ROUTE = "/listings";

export const ACCOUNT_TABS = ["/favorites", "/new", "/chats", "/me"] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number];

export function isAccountTab(value: unknown): value is AccountTab {
	return ACCOUNT_TABS.some((tab) => tab === value);
}

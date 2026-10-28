"use client";

import { CalendarIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { formatDate, formatListingDate } from "@/utils/date";

const subscribe = () => () => {};

export default function ListingDate({
	createdAt,
	variant,
}: {
	createdAt?: string | null;
	variant: "relative" | "full";
}) {
	const isClient = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

	if (!isClient || !createdAt) return null;

	const label = variant === "full" ? formatDate(createdAt) : formatListingDate(createdAt);

	if (!label) return null;

	return (
		<span className="inline-flex items-center gap-1">
			<CalendarIcon className="size-4" aria-hidden="true" />
			<time dateTime={createdAt}>{label}</time>
		</span>
	);
}

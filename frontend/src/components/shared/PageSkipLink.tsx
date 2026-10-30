"use client";

import { usePathname } from "next/navigation";

import { SkipLink } from "@/components/shared/SkipLink";

export function PageSkipLink() {
	const pathname = usePathname();

	if (pathname === "/listings") {
		return <SkipLink href="#results">Zu den Angeboten springen</SkipLink>;
	}
	if (pathname.startsWith("/listings/") && pathname !== "/listings/new") {
		return <SkipLink href="#listing-image">Zum Angebot springen</SkipLink>;
	}
	return null;
}

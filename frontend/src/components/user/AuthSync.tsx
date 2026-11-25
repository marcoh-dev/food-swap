"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { announceUser, watchOtherTabs } from "@/lib/authSync";

/**
 * Keeps the login the same in all open tabs: when the user logs in, logs out or switches accounts
 * in this tab, the other tabs render their page again (`router.refresh()`) and show the current
 * state; logging out then also closes their chat socket and clears their chats and drafts.
 */
export function AuthSync({ userId }: { userId: string | null }) {
	const router = useRouter();
	const announcedUserId = useRef(userId);

	// This tab's user changed, e.g. after logging out here: the other tabs should follow
	useEffect(() => {
		if (announcedUserId.current === userId) return;

		announcedUserId.current = userId;
		announceUser(userId);
	}, [userId]);

	useEffect(() => watchOtherTabs(userId, () => router.refresh()), [userId, router]);

	return null;
}

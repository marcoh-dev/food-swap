import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatsView } from "@/components/chat/ChatsView";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getCurrentUser } from "@/lib/users.service";

export const metadata: Metadata = { title: pageTitles.myChats };

export default async function ChatsPage({ searchParams }: PageProps<"/chats">) {
	const currentUser = await getCurrentUser();
	const { chat } = await searchParams;
	const selectedChatId = typeof chat === "string" ? chat : null;

	if (!currentUser) {
		// Back to the same chat after logging in, e.g. from a notification or another tab's logout
		const target = selectedChatId ? `/chats?chat=${selectedChatId}` : "/chats";
		redirect(`/login?redirect=${encodeURIComponent(target)}`);
	}

	return <ChatsView currentUserId={currentUser.id} selectedChatId={selectedChatId} />;
}

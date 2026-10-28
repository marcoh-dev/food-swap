import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatsView } from "@/components/chat/ChatsView";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getCurrentUser } from "@/lib/users.service";

export const metadata: Metadata = { title: pageTitles.myChats };

export default async function ChatsPage({ searchParams }: PageProps<"/chats">) {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/login?redirect=/chats");

	const { chat } = await searchParams;

	return (
		<ChatsView
			currentUserId={currentUser.id}
			selectedChatId={typeof chat === "string" ? chat : null}
		/>
	);
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users.service";
import { ChatsView } from "@/components/chat/ChatsView";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/constants/titles.constants";

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

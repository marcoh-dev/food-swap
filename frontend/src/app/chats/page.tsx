import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users.service";
import { ChatsView } from "@/components/chat/ChatsView";

export default async function ChatsPage({ searchParams }: PageProps<"/chats">) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { chat } = await searchParams;

  return (
    <ChatsView
      currentUserId={currentUser.id}
      selectedChatId={typeof chat === "string" ? chat : null}
    />
  );
}

import { UserDelete } from "@/components/user/UserDelete";
import { UserUpdate } from "@/components/user/UserUpdate";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getCurrentUser, getUserById } from "@/lib/users.service";
import { formatDate } from "@/utils/date";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: pageTitles.myProfile };

export default async function UserPage({ params }: PageProps<"/users/[id]">) {
	const { id } = await params;

	const user = await getUserById(id);
	if (!user) notFound();

	const currentUser = await getCurrentUser();
	const isOwner = currentUser?.id === user.id;

	return (
		<>
			<h2 className="text-h2">{user.name ?? user.username}</h2>
			<p>Benutzername: {user.username}</p>
			<p>Registriert seit: {formatDate(user.createdAt)}</p>
			{isOwner && (
				<>
					<UserUpdate
						currentName={user.name ?? undefined}
						currentPlace={currentUser.place}
					/>
					<UserDelete />
				</>
			)}
		</>
	);
}

import { UserDelete } from "@/components/user/UserDelete";
import { UserNameUpdate } from "@/components/user/UserNameUpdate";
import { getUserByUsername } from "@/lib/users.service";
import { formatDate } from "@/utils/date";
import { notFound } from "next/navigation";

export default async function UserPage({
  params,
}: PageProps<"/users/[username]">) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  return (
    <>
      <h2 className="text-h2">{user.name ?? user.username}</h2>
      <p>Benutzername: {user.username}</p>
      <p>Registriert seit: {formatDate(user.createdAt)}</p>
      <UserNameUpdate currentName={user.name} />
      <UserDelete />
    </>
  );
}

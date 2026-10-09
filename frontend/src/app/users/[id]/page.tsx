import { UserDelete } from "@/components/user/UserDelete";
import { UserUpdate } from "@/components/user/UserUpdate";
import { getUserById } from "@/lib/users.service";
import { formatDate } from "@/utils/date";
import { notFound } from "next/navigation";

export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <>
      <h2 className="text-h2">{user.name ?? user.username}</h2>
      <p>Benutzername: {user.username}</p>
      <p>Registriert seit: {formatDate(user.createdAt)}</p>
      <UserUpdate currentName={user.name} />
      <UserDelete />
    </>
  );
}

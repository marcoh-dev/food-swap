import { getUserByUsername } from "@/lib/users/users.service";
import { notFound } from "next/navigation";

export default async function UserPage({
    params,
}: PageProps<"/users/[username]">) {
    const {username} = await params;

    const user = await getUserByUsername(username);
    if (!user) notFound();

    return(<h2>Profil von {user.username}</h2>)
}
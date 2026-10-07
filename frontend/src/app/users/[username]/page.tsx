import { notFound } from "next/navigation";

export default async function UserPage({
    params,
}: PageProps<"/users/[username]">) {
    const {username} = await params;

    const userData = await getUserByUsername(username);
    if(userData.statusCode === 404) {
        notFound()
    }

    return(<h2>Profil von {userData.username}</h2>)
}
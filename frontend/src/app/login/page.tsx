import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserLogin } from "@/components/user/UserLogin";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getRedirectTarget } from "@/lib/redirectTarget";
import { getCurrentUser } from "@/lib/users.service";

export const metadata: Metadata = { title: pageTitles.login };

export default async function Login({ searchParams }: PageProps<"/login">) {
	const { redirect: target } = await searchParams;

	// Already logged in, e.g. here or in another tab (AuthSync): go on to where the user wanted to go
	if (await getCurrentUser().catch(() => null)) redirect(getRedirectTarget(target));

	return (
		<div className="mx-auto w-full max-w-md">
			<h1>Schön, dass du da bist!</h1>
			<UserLogin redirectTo={typeof target === "string" ? target : undefined} />
		</div>
	);
}

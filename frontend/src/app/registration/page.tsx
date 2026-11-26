import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserRegistration } from "@/components/user/UserRegistration";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getRedirectTarget } from "@/lib/redirectTarget";
import { getCurrentUser } from "@/lib/users.service";

export const metadata: Metadata = { title: pageTitles.register };

export default async function Registration({ searchParams }: PageProps<"/registration">) {
	const { redirect: target } = await searchParams;

	// Already logged in, e.g. here or in another tab (AuthSync): go on to where the user wanted to go
	if (await getCurrentUser().catch(() => null)) redirect(getRedirectTarget(target));

	return (
		<div className="mx-auto w-full max-w-md">
			<h1>Erstelle ein Konto und tausche deine Ernte.</h1>
			<UserRegistration redirectTo={typeof target === "string" ? target : undefined} />
		</div>
	);
}

import type { Metadata } from "next";

import { UserRegistration } from "@/components/user/UserRegistration";
import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.register };

export default async function Registration({ searchParams }: PageProps<"/registration">) {
	const { redirect } = await searchParams;

	return (
		<>
			<h1>Erstelle ein Konto und tausche deine Ernte.</h1>
			<UserRegistration redirectTo={typeof redirect === "string" ? redirect : undefined} />
		</>
	);
}

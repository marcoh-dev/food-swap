import type { Metadata } from "next";

import { UserLogin } from "@/components/user/UserLogin";
import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.login };

export default async function Login({ searchParams }: PageProps<"/login">) {
	const { redirect } = await searchParams;

	return (
		<div className="mx-auto w-full max-w-md">
			<h2>Was tauschst du heute?</h2>
			<UserLogin redirectTo={typeof redirect === "string" ? redirect : undefined} />
		</div>
	);
}

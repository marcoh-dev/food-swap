import { UserLogin } from "@/components/user/UserLogin";

export default async function Login({ searchParams }: PageProps<"/login">) {
	const { redirect } = await searchParams;

	return (
		<>
			<h2>Was tauschst du heute?</h2>
			<UserLogin redirectTo={typeof redirect === "string" ? redirect : undefined} />
		</>
	);
}

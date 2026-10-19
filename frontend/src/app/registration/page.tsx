import { UserRegistration } from "@/components/user/UserRegistration";

export default async function Registration({
  searchParams,
}: PageProps<"/registration">) {
  const { redirect } = await searchParams;

  return (
    <>
      <h2>Erstelle ein Konto und tausche deine Ernte.</h2>
      <UserRegistration
        redirectTo={typeof redirect === "string" ? redirect : undefined}
      />
    </>
  );
}

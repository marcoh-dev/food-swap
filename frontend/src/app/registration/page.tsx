import { UserRegistration } from "@/components/user/UserRegistration";

export default async function Registration({
  searchParams,
}: PageProps<"/registration">) {
  const { error } = await searchParams;
  return (
    <>
      <h2>Erstelle ein Konto und tausche deine Ernte.</h2>
      {error === "username-taken" && (
        <p
          role="alert"
          className="my-4 rounded-lg border-2 border-red-600 bg-red-100 px-3 py-2 text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200"
        >
          Dieser Benutzername ist schon vergeben.
        </p>
      )}
      <UserRegistration />
    </>
  );
}

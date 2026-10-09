import { UserRegistration } from "@/components/user/UserRegistration";

export default async function Registration({
  searchParams,
}: PageProps<"/registration">) {
  return (
    <>
      <h2>Erstelle ein Konto und tausche deine Ernte.</h2>
      <UserRegistration />
    </>
  );
}

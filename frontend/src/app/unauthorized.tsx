import Link from "next/link";

export default function Unauthorized() {
  return (
    <main>
      <h1>401 - Unauthorized</h1>
      <p>
        Bitte <Link href="/login">melde dich an</Link>, um diese Seite zu sehen.
      </p>
    </main>
  );
}

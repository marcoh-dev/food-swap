import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h2 className="text-h2">Home</h2>
      <Link href="/about">About</Link>
    </main>
  );
}

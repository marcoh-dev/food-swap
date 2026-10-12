"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <Link href="/listings">&#x2B60; Zurück</Link>
      <h2>Das Angebot scheint es nicht zu geben…</h2>
    </main>
  );
}

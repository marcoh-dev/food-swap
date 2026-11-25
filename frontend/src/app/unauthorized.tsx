"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Unauthorized() {
	const pathname = usePathname();
	// With the query, like AuthLink, so e.g. an open edit form comes back after logging in
	const params = new URLSearchParams(useSearchParams().toString());
	params.delete("toast");
	const query = params.toString();
	const target = query ? `${pathname}?${query}` : pathname;

	return (
		<div>
			<h1>401 – Nicht angemeldet</h1>
			<p>
				Bitte{" "}
				<Link href={`/login?redirect=${encodeURIComponent(target)}`}>melde dich an</Link>,
				um diese Seite zu sehen.
			</p>
		</div>
	);
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Unauthorized() {
	const pathname = usePathname();

	return (
		<div>
			<h1>401 – Nicht angemeldet</h1>
			<p>
				Bitte{" "}
				<Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>melde dich an</Link>,
				um diese Seite zu sehen.
			</p>
		</div>
	);
}

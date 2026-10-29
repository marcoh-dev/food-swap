"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div>
			<h2>Diesen User scheint es nicht zu geben…</h2>
			<Link href="/listings" className="inline-flex items-center gap-1">
				<ArrowRightIcon className="size-4" />
				Zur Startseite
			</Link>
		</div>
	);
}

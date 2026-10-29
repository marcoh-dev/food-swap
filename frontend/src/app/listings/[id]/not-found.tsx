"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div>
			<Link href="/listings" className="inline-flex items-center gap-1">
				<ArrowLeftIcon className="size-4" />
				Zurück
			</Link>
			<h2>Das Angebot scheint es nicht zu geben…</h2>
		</div>
	);
}

"use client";

import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";

type Props = {
	href: string;
	label: string;
	preferHistory?: boolean;
};

export default function BackButton({ href, label, preferHistory = false }: Props) {
	const router = useRouter();

	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		if (preferHistory && window.history.length > 1) {
			event.preventDefault();
			router.back();
		}
	}

	return (
		<Button asChild variant="ghost" size="sm" className="-ml-2 self-start no-underline">
			<Link href={href} onClick={handleClick}>
				<ChevronLeftIcon data-icon="inline-start" />
				{label}
			</Link>
		</Button>
	);
}

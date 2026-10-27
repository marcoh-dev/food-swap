"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type View = "grid" | "list";

export default function ViewToggle({ view }: { view: View }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const nextView: View = view === "grid" ? "list" : "grid";

	function handleToggle() {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", nextView);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}
	return (
		<Button
			variant="outline"
			size="icon"
			aria-label={
				nextView === "grid" ? "Zur Rasteransicht wechseln" : "Zur Listenansicht wechseln"
			}
			onClick={handleToggle}
		>
			{nextView === "grid" ? <LayoutGrid /> : <List />}
		</Button>
	);
}

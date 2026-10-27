"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type View = "grid" | "list";

export default function ViewToggle({ view }: { view: View }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function handleViewChange(value: View) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", value);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}
	return (
		<div className="flex gap-1">
			<Button
				variant={view === "grid" ? "secondary" : "ghost"}
				size="icon"
				aria-label="Rasteransicht"
				aria-pressed={view === "grid"}
				onClick={() => handleViewChange("grid")}
			>
				<LayoutGrid />
			</Button>
			<Button
				variant={view === "list" ? "secondary" : "ghost"}
				size="icon"
				aria-label="Listenansicht"
				aria-pressed={view === "list"}
				onClick={() => handleViewChange("list")}
			>
				<List />
			</Button>
		</div>
	);
}

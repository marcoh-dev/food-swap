"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type View = "grid" | "list";

const VIEW_OPTIONS: Record<View, { label: string; icon: typeof List }> = {
	list: { label: "Liste", icon: List },
	grid: { label: "Raster", icon: LayoutGrid },
};

export default function ViewMenu({ view }: { view: View }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function handleViewChange(value: string) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", value);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	const CurrentIcon = VIEW_OPTIONS[view].icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					aria-label={`Ansicht wählen, aktuell: ${VIEW_OPTIONS[view].label}`}
				>
					<span className="hidden sm:inline">{VIEW_OPTIONS[view].label}</span>
					<CurrentIcon size={16} strokeWidth={1} />
					<ChevronDown className="size-3" strokeWidth={1} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-auto min-w-0">
				<DropdownMenuRadioGroup value={view} onValueChange={handleViewChange}>
					{(Object.keys(VIEW_OPTIONS) as View[]).map((option) => {
						const Icon = VIEW_OPTIONS[option].icon;
						return (
							<DropdownMenuRadioItem key={option} value={option}>
								<Icon strokeWidth={1} />
								{VIEW_OPTIONS[option].label}
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

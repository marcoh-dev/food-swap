"use client";

import { ArrowDownUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useSearchPlace } from "@/components/search/SearchPlaceContext";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortOption } from "@/lib/types/listing.types";

const SORT_LABELS: Record<SortOption, string> = {
	newest: "Neueste zuerst",
	endingSoon: "Endet bald",
	nearest: "Entfernung",
};

export function SortingMenu({ sort, searchFormId }: { sort: SortOption; searchFormId?: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchPlace = useSearchPlace();

	function handleSortChange(value: string) {
		const searchForm = searchFormId ? document.getElementById(searchFormId) : null;
		if (searchForm instanceof HTMLFormElement) {
			const sortInput = searchForm.elements.namedItem("sort");
			if (sortInput instanceof HTMLInputElement) {
				sortInput.value = value;
				searchForm.requestSubmit();
				return;
			}
		}

		const params = new URLSearchParams(searchParams.toString());
		params.set("sort", value);
		params.delete("page");
		router.push(`${pathname}?${params.toString()}`);
	}

	return (
		<DropdownMenu>
			<div>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						{SORT_LABELS[sort]}
						<ArrowDownUp size={16} strokeWidth={1} />
					</Button>
				</DropdownMenuTrigger>
			</div>
			<DropdownMenuContent className="w-auto min-w-0">
				<DropdownMenuGroup>
					<DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
						<DropdownMenuRadioItem value="newest">Neueste</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="endingSoon">Endet bald</DropdownMenuRadioItem>
						{searchFormId && (
							<DropdownMenuRadioItem value="nearest" disabled={!searchPlace?.place}>
								Entfernung
							</DropdownMenuRadioItem>
						)}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

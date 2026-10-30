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
import { useSelectLikeMenu } from "@/hooks/useSelectLikeMenu";
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
	const { open, onOpenChange, triggerProps, contentProps } = useSelectLikeMenu();

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
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<div className="flex">
				<DropdownMenuTrigger asChild {...triggerProps}>
					<Button variant="outline" aria-label={`Sortierung: ${SORT_LABELS[sort]}`}>
						{SORT_LABELS[sort]}
						<ArrowDownUp size={16} strokeWidth={1} aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
			</div>
			<DropdownMenuContent className="w-auto min-w-0" {...contentProps}>
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

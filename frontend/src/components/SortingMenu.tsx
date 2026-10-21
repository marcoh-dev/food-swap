"use client";

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp } from "lucide-react";

export function SortingMenu({ sort }: { sort: SortOption }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function handleSortChange(value: string) {
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
						{sort === "newest" ? "Neueste zuerst" : "Endet bald"}
						<ArrowDownUp size={16} strokeWidth={1} />
					</Button>
				</DropdownMenuTrigger>
			</div>
			<DropdownMenuContent className="w-32">
				<DropdownMenuGroup>
					<DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
						<DropdownMenuRadioItem value="newest">Neueste</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="endingSoon">Endet bald</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

import { SORT_LABELS } from "@food-swap/shared/sorting";
import type { SortOption } from "@food-swap/shared/types";

import { SORT_OPTIONS, SortingMenuButton } from "@/components/SortingMenuButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";

type Props = {
	sort: SortOption;
	onSortChange: (sort: SortOption) => void;
};

export function SortingMenu({ sort, onSortChange }: Props) {
	// The radio group only knows strings; its values are the SortOptions below
	function handleSortChange(value: string) {
		onSortChange(value as SortOption);
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SortingMenuButton sort={sort} />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
					{SORT_OPTIONS.map((option) => (
						<DropdownMenuRadioItem key={option} value={option}>
							<Text>{SORT_LABELS[option]}</Text>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

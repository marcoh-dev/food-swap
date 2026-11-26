import { SORT_LABELS } from "@food-swap/shared/sorting";
import type { SortOption } from "@food-swap/shared/types";
import { SymbolView } from "expo-symbols";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

// The app has no search place, so it can't sort by distance
export const SORT_OPTIONS = ["newest", "endingSoon"] as const satisfies readonly SortOption[];

type Props = ButtonProps & {
	sort: SortOption;
};

/** The button that opens the sorting menu, the same on iOS and Android. */
export function SortingMenuButton({ sort, className, ...props }: Props) {
	const foreground = useThemeColor("--foreground");
	return (
		<Button
			// The dropdown trigger passes onPress and a ref here, so the menu opens
			{...props}
			variant="outline"
			className={cn("dark:bg-card-button", className)}
			accessibilityLabel={`Sortierung: ${SORT_LABELS[sort]}`}
		>
			<Text>{SORT_LABELS[sort]}</Text>
			<SymbolView
				name={{ ios: "arrow.up.arrow.down", android: "swap_vert" }}
				size={16}
				weight="light"
				tintColor={foreground}
			/>
		</Button>
	);
}

import { Host, Menu, Picker, RNHostView, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { accessibilityLabel, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { SORT_LABELS } from "@food-swap/shared/sorting";
import type { SortOption } from "@food-swap/shared/types";
import { View } from "react-native";

import { SORT_OPTIONS, SortingMenuButton } from "@/components/SortingMenuButton";

type Props = {
	sort: SortOption;
	onSortChange: (sort: SortOption) => void;
};

/** iOS: the native menu, opened by the same button as the dropdown on Android. */
export function SortingMenu({ sort, onSortChange }: Props) {
	return (
		<Host matchContents>
			<Menu
				label={
					<RNHostView matchContents>
						{/* SwiftUI handles the tap; the button is only the look */}
						<View pointerEvents="none">
							<SortingMenuButton sort={sort} />
						</View>
					</RNHostView>
				}
				modifiers={[accessibilityLabel(`Sortierung: ${SORT_LABELS[sort]}`)]}
			>
				{/* An inline picker shows the options with a checkmark on the selected one */}
				<Picker
					selection={sort}
					onSelectionChange={onSortChange}
					modifiers={[pickerStyle("inline")]}
				>
					{SORT_OPTIONS.map((option) => (
						<SwiftUIText key={option} modifiers={[tag(option)]}>
							{SORT_LABELS[option]}
						</SwiftUIText>
					))}
				</Picker>
			</Menu>
		</Host>
	);
}

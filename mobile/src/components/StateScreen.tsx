import type { ReactNode } from "react";
import { ScrollView } from "react-native";

/**
 * Full-screen state (loading, not found, errors) on a screen with a native header. The iOS header
 * is transparent and only a scroll view moves its content below it (contentInsetAdjustmentBehavior);
 * a plain View would start behind the header.
 */
export function StateScreen({ children }: { children: ReactNode }) {
	return (
		<ScrollView
			className="bg-background"
			contentContainerClassName="grow gap-4 p-6"
			contentInsetAdjustmentBehavior="automatic"
		>
			{children}
		</ScrollView>
	);
}

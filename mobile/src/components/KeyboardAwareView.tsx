import type { ReactNode } from "react";
import { View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Keeps content at the bottom of a screen (e.g. a reply field) right above the keyboard: an empty
 * space below it grows with the keyboard. It only needs the keyboard height, measured from the
 * bottom of the screen, so the native header and the Android navigation mode don't matter.
 */
export function KeyboardAwareView({ children }: { children: ReactNode }) {
	// Negative while the keyboard is open (how far content would have to move up)
	const { height } = useReanimatedKeyboardAnimation();
	const insets = useSafeAreaInsets();

	// The content keeps room for the bottom inset itself, which the keyboard covers anyway
	const spacerStyle = useAnimatedStyle(() => ({
		height: Math.max(-height.value - insets.bottom, 0),
	}));

	return (
		<View className="flex-1 bg-background">
			{children}
			<Animated.View style={spacerStyle} />
		</View>
	);
}

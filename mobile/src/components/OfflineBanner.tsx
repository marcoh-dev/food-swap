import { HeaderHeightContext } from "expo-router/react-navigation";
import { SymbolView } from "expo-symbols";
import { useContext, useEffect } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useShowOfflineBanner } from "@/hooks/useShowOfflineBanner";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
	/** Shown after "Offline", e.g. how old the shown data is ("Stand 14:05 Uhr"). */
	detail?: string;
	/**
	 * The screen's native header, if it has one: `native` for the default header (transparent on
	 * iOS, so the pill goes below it), `opaque` for one with `headerTransparent: false`. Without a
	 * header, the pill goes below the status bar.
	 */
	header?: "native" | "opaque";
};

/**
 * A slim pill at the top edge while the device is offline (after half a second). It floats above
 * the content instead of pushing it down, so nothing below moves, and fits into the screens' top
 * padding (24 px) so it doesn't cover the heading. Place it as the last child of the view that
 * fills the screen.
 */
export function OfflineBanner(props: Props) {
	const show = useShowOfflineBanner();

	return show ? <Pill {...props} /> : null;
}

function Pill({ detail, header }: Props) {
	const insets = useSafeAreaInsets();
	const headerHeight = useContext(HeaderHeightContext) ?? 0;
	let top = 0;
	if (!header) top = insets.top;
	else if (header === "native" && Platform.OS === "ios") top = headerHeight;
	const iconColor = useThemeColor("--info");
	const text = detail ? `Offline · ${detail}` : "Offline";
	const label = detail ? `Du bist offline. ${detail}` : "Du bist offline";

	useEffect(() => {
		AccessibilityInfo.announceForAccessibility(label);
	}, [label]);

	return (
		<Animated.View
			entering={FadeInUp}
			exiting={FadeOutUp}
			// Touches go through to the content below, so scrolling works on the pill too
			pointerEvents="none"
			className="absolute inset-x-0 items-center"
			style={{ top }}
		>
			<View
				className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-0.5 shadow-sm shadow-black/25"
				accessible
				accessibilityRole="alert"
				accessibilityLabel={label}
			>
				<SymbolView
					name={{ ios: "wifi.slash", android: "wifi_off" }}
					size={14}
					tintColor={iconColor}
				/>
				<Text className="text-sm">{text}</Text>
			</View>
		</Animated.View>
	);
}

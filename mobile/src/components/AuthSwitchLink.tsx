import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { isAccountTab } from "@/lib/routes";

type AuthSwitchLinkProps = {
	/** The sentence before the link, e.g. "Neu bei FoodSwap? Hier geht's zur". */
	text: string;
	linkText: string;
	to: "/login" | "/registration";
};

/**
 * The link between login and registration, e.g. "Neu bei FoodSwap? Hier geht's zur Registrierung."
 * It replaces the open modal, so closing the other one leads back to where the user came from;
 * the target tab (`redirect`) carries over.
 */
export function AuthSwitchLink({ text, linkText, to }: AuthSwitchLinkProps) {
	const router = useRouter();
	const { redirect } = useLocalSearchParams();

	return (
		// The link is its own element: a larger tap target, and its underline doesn't depend on how
		// text nested in another text is styled
		<View className="flex-row flex-wrap items-baseline">
			<Text className="text-body-small">{`${text} `}</Text>
			<Pressable
				accessibilityRole="link"
				hitSlop={8}
				onPress={() =>
					router.replace(isAccountTab(redirect) ? `${to}?redirect=${redirect}` : to)
				}
			>
				<Text className="text-body-small underline">{linkText}</Text>
			</Pressable>
			<Text className="text-body-small">.</Text>
		</View>
	);
}

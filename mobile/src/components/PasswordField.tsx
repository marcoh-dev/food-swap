import { SymbolView } from "expo-symbols";
import { type ComponentProps, useState } from "react";
import { Pressable } from "react-native";

import { TextField } from "@/components/TextField";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = Omit<ComponentProps<typeof TextField>, "secureTextEntry" | "accessory">;

/** A password field with a button that shows or hides the password, like the web's PasswordInput. */
export function PasswordField(props: Props) {
	const [isVisible, setIsVisible] = useState(false);
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<TextField
			{...props}
			secureTextEntry={!isVisible}
			accessory={
				<Pressable
					onPress={() => setIsVisible((visible) => !visible)}
					accessibilityRole="button"
					accessibilityLabel={isVisible ? "Passwort verbergen" : "Passwort anzeigen"}
					hitSlop={8}
					className="h-10 w-11 items-center justify-center"
				>
					<SymbolView
						name={
							isVisible
								? { ios: "eye.slash", android: "visibility_off" }
								: { ios: "eye", android: "visibility" }
						}
						size={20}
						tintColor={mutedForeground}
					/>
				</Pressable>
			}
		/>
	);
}

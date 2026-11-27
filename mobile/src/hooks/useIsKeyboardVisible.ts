import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/** Whether the software keyboard is open. */
export function useIsKeyboardVisible() {
	const [isVisible, setIsVisible] = useState(Keyboard.isVisible());

	useEffect(() => {
		const showListener = Keyboard.addListener("keyboardDidShow", () => setIsVisible(true));
		const hideListener = Keyboard.addListener("keyboardDidHide", () => setIsVisible(false));

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);

	return isVisible;
}

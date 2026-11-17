import { useNativeVariable } from "react-native-css/native";

export function useThemeColor(name: `--${string}`): string | undefined {
	const value: unknown = useNativeVariable(name);
	return typeof value === "string" ? value : undefined;
}

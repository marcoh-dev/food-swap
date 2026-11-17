import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/useThemeColor";
import "@/global.css";

export default function RootLayout() {
	const isDark = useColorScheme() === "dark";
	const baseTheme = isDark ? DarkTheme : DefaultTheme;
	const background = useThemeColor("--background");
	const foreground = useThemeColor("--foreground");
	const border = useThemeColor("--border");
	const tabActive = useThemeColor("--tab-active");

	const theme = {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			primary: tabActive ?? baseTheme.colors.primary,
			background: background ?? baseTheme.colors.background,
			card: background ?? baseTheme.colors.card,
			text: foreground ?? baseTheme.colors.text,
			border: border ?? baseTheme.colors.border,
		},
	};

	return (
		<ThemeProvider value={theme}>
			<SafeAreaProvider>
				<StatusBar style="auto" />
				<Stack screenOptions={{ headerShown: false }} />
			</SafeAreaProvider>
		</ThemeProvider>
	);
}

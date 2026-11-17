import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { syncAppFocus } from "@/api/appFocus";
import { syncOnlineStatus } from "@/api/onlineStatus";
import { isNotFoundError } from "@/api/request";
import { EnvError } from "@/components/EnvError";
import { envError } from "@/env";
import { useThemeColor } from "@/hooks/useThemeColor";
import "@/global.css";

const MAX_RETRIES = 3;
const STALE_TIME = 5 * 60 * 1000;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME,
			retry: (failureCount, error) => !isNotFoundError(error) && failureCount < MAX_RETRIES,
		},
	},
});

syncAppFocus();
syncOnlineStatus();

export default function RootLayout() {
	const isDark = useColorScheme() === "dark";
	const baseTheme = isDark ? DarkTheme : DefaultTheme;
	const background = useThemeColor("--background");
	const foreground = useThemeColor("--foreground");
	const border = useThemeColor("--border");
	const tabActive = useThemeColor("--tab-active");
	const [fontsLoaded, fontError] = useFonts({
		Geist_400Regular,
		Geist_500Medium,
		Geist_600SemiBold,
		Geist_700Bold,
	});

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

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={theme}>
				<SafeAreaProvider>
					<StatusBar style="auto" />
					{envError ? (
						<EnvError message={envError} />
					) : (
						<Stack screenOptions={{ headerShown: false }} />
					)}
				</SafeAreaProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

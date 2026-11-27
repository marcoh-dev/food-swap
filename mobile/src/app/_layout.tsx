import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { syncAppFocus } from "@/api/appFocus";
import { syncOnlineStatus } from "@/api/onlineStatus";
import { isNotFoundError, isUnauthorizedError } from "@/api/request";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatSocketConnector } from "@/components/ChatSocketConnector";
import { CloseButton } from "@/components/CloseButton";
import { EnvError } from "@/components/EnvError";
import { NotificationTapHandler } from "@/components/NotificationTapHandler";
import { envError } from "@/env";
import { useThemeColor } from "@/hooks/useThemeColor";
import { setUpNotifications } from "@/lib/pushNotifications";
import "@/global.css";

const MAX_RETRIES = 3;
const STALE_TIME = 5 * 60 * 1000;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME,
			retry: (failureCount, error) =>
				!isNotFoundError(error) &&
				!isUnauthorizedError(error) &&
				failureCount < MAX_RETRIES,
		},
	},
});

syncAppFocus();
syncOnlineStatus();
setUpNotifications();

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
					{/* The app is edge to edge (Expo SDK 58); without these, the provider adds its own
					    bars at the top and bottom on Android */}
					<KeyboardProvider
						statusBarTranslucent
						navigationBarTranslucent
						preserveEdgeToEdge
					>
						<StatusBar style="auto" />
						{envError ? (
							<EnvError message={envError} />
						) : (
							<AuthProvider>
								<ChatSocketConnector />
								<Stack screenOptions={{ headerShown: false }}>
									<Stack.Screen
										name="listings/[id]"
										options={{
											headerShown: true,
											title: "Angebot",
											headerBackButtonDisplayMode: "minimal",
										}}
									/>
									<Stack.Screen
										name="chats/[id]"
										options={{
											headerShown: true,
											title: "Chat",
											headerBackButtonDisplayMode: "minimal",
											// Android: next to the back button like Android messengers; iOS centres it
											headerTitleAlign: "left",
											// Not transparent: the inverted message list can't move its content below a
											// transparent header the way other scroll views do
											headerTransparent: false,
										}}
									/>
									<Stack.Screen
										name="login"
										options={{
											presentation: "modal",
											headerShown: true,
											title: "Anmelden",
											headerLeft: () => <CloseButton />,
										}}
									/>
									<Stack.Screen
										name="registration"
										options={{
											presentation: "modal",
											headerShown: true,
											title: "Registrieren",
											headerLeft: () => <CloseButton />,
										}}
									/>
									<Stack.Screen
										name="profile/edit"
										options={{
											presentation: "modal",
											headerShown: true,
											title: "Profil bearbeiten",
											headerLeft: () => <CloseButton />,
											// Not transparent: on iOS, focusing a field scrolled it under a transparent header
											headerTransparent: false,
										}}
									/>
								</Stack>
								<NotificationTapHandler />
							</AuthProvider>
						)}
						<PortalHost />
					</KeyboardProvider>
				</SafeAreaProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

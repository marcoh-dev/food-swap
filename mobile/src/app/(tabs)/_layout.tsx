import { useRouter } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";

import { useAuth } from "@/components/AuthProvider";
import { useIsKeyboardVisible } from "@/hooks/useIsKeyboardVisible";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUnreadChatsCount } from "@/hooks/useUnreadChatsCount";
import type { AccountTab } from "@/lib/routes";

export default function TabLayout() {
	const tabActive = useThemeColor("--tab-active");
	const card = useThemeColor("--card");
	const accent = useThemeColor("--accent");
	const primary = useThemeColor("--primary");
	const primaryForeground = useThemeColor("--primary-foreground");
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const { data: unreadChats = 0 } = useUnreadChatsCount({ enabled: isLoggedIn });
	const showBadge = isLoggedIn && unreadChats > 0;
	const isKeyboardVisible = useIsKeyboardVisible();

	function requireLogin(tab: AccountTab) {
		return {
			tabPress: () => {
				if (!isLoggedIn) {
					router.push(`/login?redirect=${tab}`);
				}
			},
		};
	}

	return (
		<NativeTabs
			tintColor={tabActive}
			backgroundColor={card}
			indicatorColor={accent}
			badgeBackgroundColor={primary}
			badgeTextColor={primaryForeground}
			minimizeBehavior="onScrollDown"
			labelVisibilityMode="labeled"
			// Android: the tab bar would sit above the keyboard; hidden while typing, like in other
			// Android apps (iOS covers it with the keyboard itself)
			hidden={Platform.OS === "android" && isKeyboardVisible}
		>
			<NativeTabs.Trigger name="listings">
				<NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
				<NativeTabs.Trigger.Label>Angebote</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="favorites"
				disabled={!isLoggedIn}
				listeners={requireLogin("/favorites")}
			>
				<NativeTabs.Trigger.Icon
					src={require("@/assets/images/tabs/tomato.png")}
					renderingMode="template"
				/>
				<NativeTabs.Trigger.Label>Favoriten</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="new" disabled={!isLoggedIn} listeners={requireLogin("/new")}>
				<NativeTabs.Trigger.Icon sf="plus" md="add_2" />
				<NativeTabs.Trigger.Label>Neu</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="chats"
				disabled={!isLoggedIn}
				listeners={requireLogin("/chats")}
			>
				<NativeTabs.Trigger.Icon sf="bubble" md="chat_bubble" />
				<NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
				{/* Without text the badge isn't shown; `hidden` alone left a "0" badge visible */}
				<NativeTabs.Trigger.Badge hidden={!showBadge}>
					{showBadge ? String(unreadChats) : undefined}
				</NativeTabs.Trigger.Badge>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="me" disabled={!isLoggedIn} listeners={requireLogin("/me")}>
				<NativeTabs.Trigger.Icon sf="person" md="person" />
				<NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

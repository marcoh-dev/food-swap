import { NativeTabs } from "expo-router/native-tabs";

import { useThemeColor } from "@/hooks/useThemeColor";

export default function TabLayout() {
	const tabActive = useThemeColor("--tab-active");
	const card = useThemeColor("--card");
	const accent = useThemeColor("--accent");

	return (
		<NativeTabs
			tintColor={tabActive}
			backgroundColor={card}
			indicatorColor={accent}
			minimizeBehavior="onScrollDown"
			labelVisibilityMode="labeled"
		>
			<NativeTabs.Trigger name="listings">
				<NativeTabs.Trigger.Label>Angebote</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="favorites">
				<NativeTabs.Trigger.Icon sf="ant" md="bug_report" />
				<NativeTabs.Trigger.Label>Favoriten</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="new">
				<NativeTabs.Trigger.Icon sf="plus" md="add" />
				<NativeTabs.Trigger.Label>Neu</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="chats">
				<NativeTabs.Trigger.Icon sf="message" md="chat" />
				<NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="me">
				<NativeTabs.Trigger.Icon sf="person" md="person" />
				<NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

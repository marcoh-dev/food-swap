import { NativeTabs } from "expo-router/native-tabs";

export default function TabLayout() {
	return (
		<NativeTabs labelVisibilityMode="labeled">
			<NativeTabs.Trigger name="listings">
				<NativeTabs.Trigger.Label>Angebote</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="favorites">
				{/* <NativeTabs.Trigger.Icon sf="ant" md="bug_report" /> */}
				<NativeTabs.Trigger.Icon sf="heart" md="favorite" />
				<NativeTabs.Trigger.Label>Favoriten</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="new">
				<NativeTabs.Trigger.Icon sf="plus" md="add" />
				<NativeTabs.Trigger.Label>Neu</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="chats">
				{/* <NativeTabs.Trigger.Icon sf="message" md="chat" /> */}
				<NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right" md="forum" />
				<NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="me">
				{/* <NativeTabs.Trigger.Icon sf="person" md="person" /> */}
				<NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
				<NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

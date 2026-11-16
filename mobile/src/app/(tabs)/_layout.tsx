import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { NativeTabs } from 'expo-router/native-tabs';

const SearchIcon = MaterialDesignIcons.getImageSourceSync("home", 24, 'black')
const BugIcon = MaterialDesignIcons.getImageSourceSync("home", 24, 'black')
const AddIcon = MaterialDesignIcons.getImageSourceSync("home", 24, 'black')
const ChatIcon = MaterialDesignIcons.getImageSourceSync('chat', 24, 'black')
const PersonIcon = MaterialDesignIcons.getImageSourceSync('home', 24, 'black')

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Label>Angebote</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="magnifyingglass" src={SearchIcon} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="favorites">
				<NativeTabs.Trigger.Icon sf="ant" src={BugIcon} />
				<NativeTabs.Trigger.Label>Favoriten</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="new">
				<NativeTabs.Trigger.Icon sf="plus" src={AddIcon} />
				<NativeTabs.Trigger.Label>Neu</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="chat">
				<NativeTabs.Trigger.Icon sf="message" src={ChatIcon} />
				<NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="profile">
				<NativeTabs.Trigger.Icon sf="person" src={PersonIcon} />
				<NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

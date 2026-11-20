import { Notice } from "@/components/Notice";

type Props = {
	message: string;
};

export function OfflineNotice({ message }: Props) {
	return (
		<Notice
			icon={{ ios: "wifi.slash", android: "wifi_off" }}
			title="Du bist offline"
			message={message}
		/>
	);
}

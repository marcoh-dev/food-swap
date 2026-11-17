import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function Profile() {
	return (
		<RequireLogin>
			<Screen>
				<Text variant="h2">Profile</Text>
			</Screen>
		</RequireLogin>
	);
}

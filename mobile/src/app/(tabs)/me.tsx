import { useAuth } from "@/components/AuthProvider";
import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Profile() {
	const { logOut } = useAuth();

	return (
		<RequireLogin>
			<Screen>
				<Text variant="h2">Profile</Text>
				<Button variant="outline" onPress={() => void logOut()}>
					<Text>Abmelden</Text>
				</Button>
			</Screen>
		</RequireLogin>
	);
}

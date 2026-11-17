import { Link } from "expo-router";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Profile() {
	return (
		<Screen>
			<Text variant="h2">Profile</Text>
			<Link href="/login" asChild>
				<Button>
					<Text>Anmelden</Text>
				</Button>
			</Link>
		</Screen>
	);
}

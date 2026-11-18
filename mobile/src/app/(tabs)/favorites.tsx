import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function Favorites() {
	return (
		<RequireLogin>
			<Screen>
				<Text variant="h2">Favoriten</Text>
			</Screen>
		</RequireLogin>
	);
}

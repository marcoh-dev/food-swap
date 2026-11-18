import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function New() {
	return (
		<RequireLogin>
			<Screen>
				<Text variant="h2">New</Text>
			</Screen>
		</RequireLogin>
	);
}

import { SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function TermSearch({ defaultValue = "" }: { defaultValue?: string }) {
	return (
		<InputGroup>
			<InputGroupAddon>
				<SearchIcon aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				name="term"
				aria-label="Suchbegriff"
				placeholder="Was suchst du?"
				defaultValue={defaultValue}
			/>
		</InputGroup>
	);
}

import { SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

export default function TermSearch({ defaultValue = "" }: { defaultValue?: string }) {
	return (
		<InputGroup>
			<InputGroupAddon>
				<SearchIcon />
			</InputGroupAddon>
			<InputGroupInput name="term" placeholder="Was suchst du?" defaultValue={defaultValue} />
		</InputGroup>
	);
}

import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { SearchIcon } from "lucide-react";

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

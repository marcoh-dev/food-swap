"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";

type Props = {
	id: string;
	name: string;
	autoComplete?: string;
	placeholder?: string;
};

export default function PinInput({ id, name, autoComplete = "off", placeholder }: Props) {
	const [isVisible, setIsVisible] = useState(false);

	function handleToggleVisibility() {
		setIsVisible((previous) => !previous);
	}

	return (
		<InputGroup>
			<InputGroupInput
				id={id}
				name={name}
				type={isVisible ? "text" : "password"}
				autoComplete={autoComplete}
				placeholder={placeholder}
				required
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					type="button"
					size="icon-xs"
					onClick={handleToggleVisibility}
					aria-label={isVisible ? "PIN verbergen" : "PIN anzeigen"}
					aria-pressed={isVisible}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}

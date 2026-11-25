"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";

type Props = React.ComponentProps<typeof InputGroupInput> & {
	id: string;
	name: string;
};

/** A password field with a button that shows or hides the password. */
export default function PasswordInput({ id, name, autoComplete = "off", ...props }: Props) {
	const [isVisible, setIsVisible] = useState(false);

	function handleToggleVisibility() {
		setIsVisible((previous) => !previous);
	}

	return (
		<InputGroup>
			<InputGroupInput
				id={id}
				name={name}
				autoComplete={autoComplete}
				autoCapitalize="off"
				autoCorrect="off"
				{...props}
				type={isVisible ? "text" : "password"}
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					type="button"
					size="icon-xs"
					onClick={handleToggleVisibility}
					aria-label={isVisible ? "Passwort verbergen" : "Passwort anzeigen"}
					aria-pressed={isVisible}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}

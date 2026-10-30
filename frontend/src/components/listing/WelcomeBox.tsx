"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WELCOME_DISMISSED_COOKIE } from "@/lib/constants/welcome.constants";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function WelcomeBox() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) return null;

	function dismiss() {
		document.cookie = `${WELCOME_DISMISSED_COOKIE}=1; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
		setIsOpen(false);
	}

	return (
		<section
			aria-labelledby="welcome-heading"
			className="relative mb-6 rounded-xl bg-card p-4 pr-14 ring-1 ring-foreground/10"
		>
			<h2 id="welcome-heading" className="text-h2">
				Willkommen bei FoodSwap!
			</h2>
			<p>
				Teile, was du hast.
				<br />
				Finde, was du brauchst.
			</p>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2"
				onClick={dismiss}
			>
				<XIcon aria-hidden="true" />
				<span className="sr-only">Willkommenstext schließen</span>
			</Button>
		</section>
	);
}

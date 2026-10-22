// components/ui/mode-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const themeOptions = [
	{ value: "system", label: "Systemeinstellung", icon: SunMoon },
	{ value: "light", label: "Helles Design", icon: Sun },
	{ value: "dark", label: "Dunkles Design", icon: Moon },
] as const;

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// theme ist erst im Browser bekannt -> verhindert Hydration-Mismatch
	useEffect(() => setMounted(true), []);

	return (
		<div className="flex items-center justify-between">
			<span className="text-body">Design</span>
			<ToggleGroup
				type="single"
				variant="outline"
				value={mounted ? theme : undefined}
				onValueChange={(value) => {
					if (value) setTheme(value);
				}}
				aria-label="Design auswählen"
			>
				{themeOptions.map(({ value, label, icon: Icon }) => (
					<ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
						<Icon className="h-[1.2rem] w-[1.2rem]" />
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

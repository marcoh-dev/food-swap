import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [{ text: ["h1", "h2", "h3", "section", "body", "body-small", "body-s"] }],
			// The weight utilities switch the font family here (global.css), so the heading font
			// has to replace them
			"font-weight": [{ font: ["heading"] }],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

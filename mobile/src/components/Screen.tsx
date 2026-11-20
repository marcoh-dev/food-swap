import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";

export function Screen({ className, ...props }: ViewProps) {
	return (
		<View
			className={cn("flex-1 gap-4 bg-background px-6 pt-safe-offset-6", className)}
			{...props}
		/>
	);
}

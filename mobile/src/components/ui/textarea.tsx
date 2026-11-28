import type { Ref } from "react";
import { Platform, TextInput, type TextInputInstance, type TextInputProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

type TextareaProps = TextInputProps & { invalid?: boolean; ref?: Ref<TextInputInstance> };

function Textarea({ className, invalid, ...props }: TextareaProps) {
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<TextInput
			multiline={true}
			textAlignVertical="top"
			className={cn(
				"flex min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 font-normal text-base leading-5 text-foreground shadow-sm shadow-black/5 dark:bg-input/30",
				props.editable === false && "opacity-50",
				Platform.select({
					web: "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				}),
				invalid && "border-destructive",
				className,
			)}
			placeholderTextColor={mutedForeground}
			{...props}
		/>
	);
}

export { Textarea };

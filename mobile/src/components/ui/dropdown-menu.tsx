import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { SymbolView } from "expo-symbols";
import * as React from "react";
import { Platform, type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { FadeIn, ReduceMotion } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { TextClassContext } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function DropdownMenuContent({
	className,
	overlayClassName,
	overlayStyle,
	portalHost,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
	overlayStyle?: StyleProp<ViewStyle>;
	overlayClassName?: string;
	portalHost?: string;
}) {
	return (
		<DropdownMenuPrimitive.Portal hostName={portalHost}>
			<FullWindowOverlay>
				<DropdownMenuPrimitive.Overlay
					style={Platform.select({
						web: overlayStyle ?? undefined,
						native: overlayStyle
							? StyleSheet.flatten([
									StyleSheet.absoluteFill,
									overlayStyle as typeof StyleSheet.absoluteFill,
								])
							: StyleSheet.absoluteFill,
					})}
					className={overlayClassName}
					asChild={Platform.OS !== "web"}
				>
					<NativeOnlyAnimatedView
						entering={FadeIn.reduceMotion(ReduceMotion.System)}
						as="Pressable"
					>
						<TextClassContext.Provider value="text-popover-foreground">
							<DropdownMenuPrimitive.Content
								className={cn(
									"min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg shadow-black/5",
									Platform.select({
										web: cn(
											"animate-in fade-in-0 zoom-in-95 z-50 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) cursor-default",
											props.side === "bottom" && "slide-in-from-top-2",
											props.side === "top" && "slide-in-from-bottom-2",
										),
									}),
									className,
								)}
								{...props}
							/>
						</TextClassContext.Provider>
					</NativeOnlyAnimatedView>
				</DropdownMenuPrimitive.Overlay>
			</FullWindowOverlay>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	className?: string;
	inset?: boolean;
	variant?: "default" | "destructive";
}) {
	return (
		<TextClassContext.Provider
			value={cn(
				"text-sm text-popover-foreground select-none group-active:text-popover-foreground",
				variant === "destructive" && "text-destructive group-active:text-destructive",
			)}
		>
			<DropdownMenuPrimitive.Item
				className={cn(
					"group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 active:bg-accent sm:py-1.5",
					Platform.select({
						web: cn(
							"cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none",
							variant === "destructive" &&
								"focus:bg-destructive/10 dark:focus:bg-destructive/20",
						),
					}),
					variant === "destructive" &&
						"active:bg-destructive/10 dark:active:bg-destructive/20",
					props.disabled && "opacity-50",
					inset && "pl-8",
					className,
				)}
				{...props}
			/>
		</TextClassContext.Provider>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
	children?: React.ReactNode;
}) {
	const popoverForeground = useThemeColor("--popover-foreground");
	return (
		<TextClassContext.Provider value="text-sm text-popover-foreground select-none group-active:text-accent-foreground">
			<DropdownMenuPrimitive.RadioItem
				className={cn(
					"group relative flex flex-row items-center gap-2 rounded-sm py-2 pr-8 pl-2 active:bg-accent sm:py-1.5",
					Platform.select({
						web: "cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none",
					}),
					props.disabled && "opacity-50",
					className,
				)}
				{...props}
			>
				<View className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
					<DropdownMenuPrimitive.ItemIndicator>
						<SymbolView
							name={{ ios: "checkmark", android: "check" }}
							size={14}
							tintColor={popoverForeground}
						/>
					</DropdownMenuPrimitive.ItemIndicator>
				</View>
				<>{children}</>
			</DropdownMenuPrimitive.RadioItem>
		</TextClassContext.Provider>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	className?: string;
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Label
			className={cn(
				"px-2 py-2 font-medium text-sm text-foreground sm:py-1.5",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
};

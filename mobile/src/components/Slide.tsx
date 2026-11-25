import { Image, Text, View } from "react-native";

/** The slide's height without text: its padding around the text block (py-2). */
export const SLIDE_PADDING_HEIGHT = 16;
/** The slides' height in the first frame, until their text is measured (the former `h-54`). */
export const INITIAL_SLIDE_HEIGHT = 216;

type Props = {
	title: string;
	body: string;
	source?: string;
	image?: string;
	/** The same height for all slides, set by the carousel from the slide with the most text. */
	height?: number;
	/** Reports the height the text needs, independent of `height`, so measuring can't loop. */
	onTextHeight?: (height: number) => void;
	/** The slide's place in the carousel, read out by screen readers ("Karte 2 von 5"). */
	position: number;
	total: number;
};

export default function Slide({
	title,
	body,
	source,
	image,
	height,
	onTextHeight,
	position,
	total,
}: Props) {
	// One element for screen readers, with the position first, so it's clear there are more cards
	const label = [`Karte ${position} von ${total}`, title.replace(/\n/g, " "), body, source]
		.filter(Boolean)
		.join(". ");

	return (
		<View
			className="rounded-2xl bg-highlight-muted shadow-md shadow-black/25 dark:border dark:border-highlight-border"
			accessible
			accessibilityLabel={label}
		>
			<View
				className="overflow-hidden rounded-2xl px-2 py-2"
				style={{ height: height ?? INITIAL_SLIDE_HEIGHT }}
			>
				{image ? (
					<>
						<Image
							source={{ uri: image }}
							resizeMode="cover"
							className="absolute inset-0"
						/>
						<View className="absolute inset-0 bg-black/20" />
					</>
				) : null}
				<View
					className="mt-auto gap-1 p-4"
					onLayout={(event) => onTextHeight?.(event.nativeEvent.layout.height)}
				>
					<Text className="font-bold text-3xl text-highlight-foreground">{title}</Text>
					<Text className="text-highlight-foreground">{body}</Text>
					{source ? (
						<Text className="text-xs text-highlight-muted-foreground">{source}</Text>
					) : null}
				</View>
			</View>
		</View>
	);
}

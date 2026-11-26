import { useState } from "react";
import { FlatList, View } from "react-native";

import Slide, { INITIAL_SLIDE_HEIGHT, SLIDE_PADDING_HEIGHT } from "@/components/Slide";
import { SLIDES } from "@/lib/slides";
import { cn } from "@/lib/utils";

const EDGE = 24;
const GAP = 24;

export default function Carousel() {
	const [width, setWidth] = useState(0);
	const [index, setIndex] = useState(0);
	// All slides as tall as the one with the most text (it grows with larger font sizes). Measured
	// from the text, which doesn't depend on the slide's height, so measuring can't feed back.
	const [slideHeight, setSlideHeight] = useState<number>();

	const slideWidth = Math.max(width - EDGE * 2, 0);
	const interval = slideWidth + GAP;
	return (
		<View className="gap-1">
			<FlatList
				className="-mx-6"
				contentContainerStyle={{ paddingHorizontal: EDGE }}
				data={SLIDES}
				keyExtractor={(slide) => slide.id}
				horizontal
				showsHorizontalScrollIndicator={false}
				snapToInterval={interval}
				snapToAlignment="start"
				decelerationRate="fast"
				disableIntervalMomentum
				ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
				onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
				scrollEventThrottle={16}
				onScroll={(e) => {
					if (!interval) return;
					const next = Math.round(e.nativeEvent.contentOffset.x / interval);
					if (next !== index) setIndex(next);
				}}
				// Only once the width is known: at width 0, the text would wrap after every letter and its
				// measured height would make all slides far too tall
				renderItem={({ item, index: slideIndex }) =>
					slideWidth > 0 ? (
						<View style={{ width: slideWidth }} className="pt-1 pb-4">
							<Slide
								title={item.title}
								body={item.body}
								source={item.source}
								image={item.image}
								height={slideHeight ?? INITIAL_SLIDE_HEIGHT}
								position={slideIndex + 1}
								total={SLIDES.length}
								onTextHeight={(textHeight) => {
									const needed = Math.ceil(textHeight + SLIDE_PADDING_HEIGHT);
									setSlideHeight((current) => Math.max(current ?? 0, needed));
								}}
							/>
						</View>
					) : null
				}
			/>
			<View className="flex-row justify-center gap-1.5">
				{SLIDES.map((slide, i) => (
					<View
						key={slide.id}
						className={cn(
							"h-1.5 w-1.5 rounded-full",
							i === index
								? "bg-input dark:bg-foreground"
								: "bg-border dark:bg-muted-foreground",
						)}
					/>
				))}
			</View>
		</View>
	);
}

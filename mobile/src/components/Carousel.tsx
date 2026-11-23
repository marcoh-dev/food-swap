import { useState } from "react";
import { FlatList, View } from "react-native";

import Slide from "@/components/Slide";
import { SLIDES } from "@/lib/slides";
import { cn } from "@/lib/utils";

const EDGE = 24;
const GAP = 24;

export default function Carousel() {
	const [width, setWidth] = useState(0);
	const [index, setIndex] = useState(0);

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
				renderItem={({ item }) => (
					<View style={{ width: slideWidth }} className="pt-1 pb-4">
						<Slide
							title={item.title}
							body={item.body}
							source={item.source}
							image={item.image}
						/>
					</View>
				)}
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

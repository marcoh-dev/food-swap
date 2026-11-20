import { useState } from "react";
import { FlatList, View } from "react-native";

import Slide from "@/components/Slide";
import { SLIDES } from "@/lib/slides";
import { cn } from "@/lib/utils";

export default function Carousel() {
	const [width, setWidth] = useState(0);
	const [index, setIndex] = useState(0);
	return (
		<View className="gap-2">
			<FlatList
            className="-mr-3"
				data={SLIDES}
				keyExtractor={(slide) => slide.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
				onMomentumScrollEnd={(e) =>
					setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
				}
				renderItem={({ item }) => (
					<View style={{ width }} className="pr-3">
						<Slide title={item.title} body={item.body} source={item.source} image={item.image}/>
					</View>
				)}
			/>
			<View className="flex-row justify-center gap-1.5">
				{SLIDES.map((slide, i) => (
					<View
						key={slide.id}
						className={cn(
							"h-2 w-2 rounded-full",
							i === index ? "bg-foreground" : "bg-muted-foreground",
						)}
			
					/>
				))}
			</View>
		</View>
	);
}

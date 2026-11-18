import { SymbolView } from "expo-symbols";
import { Image, ScrollView, Text, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import type { ListingResponse } from "@/lib/types/listing.types";

const SOON_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type ListingCardProps = Pick<
	ListingResponse,
	"title" | "image" | "place" | "type" | "category" | "tags" | "createdAt" | "endDate"
> & {
	statusLabel?: string;
	now: number;
};

export default function ListingCard({
	title,
	image,
	place,
	type,
	category,
	tags,
	createdAt,
	endDate,
	statusLabel,
	now,
}: ListingCardProps) {
	const daysLeft = Math.ceil((new Date(endDate).getTime() - now) / DAY_MS);
	const endsSoon = daysLeft >= 0 && daysLeft <= SOON_DAYS;

	const foreground = useThemeColor("--foreground");
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<View className="h-44 flex-row overflow-hidden bg-card">
			<View className="w-2/5 bg-muted">
				{image ? (
					<Image
						source={{ uri: image }}
						className="absolute inset-0"
						resizeMode="cover"
					/>
				) : null}

				<View className="absolute inset-x-2 top-2 flex-row items-start justify-between gap-1">
					{statusLabel ? (
						<View className="rounded-full bg-primary px-2 py-0.5">
							<Text className="font-medium text-xs text-primary-foreground">
								{statusLabel}
							</Text>
						</View>
					) : (
						<View />
					)}
					<View
						accessible
						accessibilityLabel={type === "swap" ? "Tauschen" : "Verschenken"}
						className="h-5 flex-row items-center justify-center rounded-full bg-background px-2 shadow-sm"
					>
						<SymbolView
							name={
								type === "swap"
									? {
											ios: "repeat",
											android: "repeat",
										}
									: {
											ios: "gift",
											android: "redeem",
										}
							}
							size={12}
							tintColor={foreground}
						/>
					</View>
				</View>

				{endsSoon && (
					<View className="absolute bottom-2 left-2 rounded-full bg-background px-2 py-0.5 shadow-sm">
						<Text className="font-medium text-xs text-foreground">
							{daysLeft === 0
								? "Läuft heute ab"
								: daysLeft === 1
									? "Noch 1 Tag"
									: `Noch ${daysLeft} Tage`}
						</Text>
					</View>
				)}
			</View>

			<View className="min-w-0 flex-1 gap-1 px-4 py-3">
				<Text className="font-medium text-base text-foreground" numberOfLines={2}>
					{title}
				</Text>
				<View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
					<View className="shrink flex-row items-center gap-1">
						<SymbolView
							name={{ ios: "mappin", android: "location_on" }}
							size={12}
							tintColor={mutedForeground}
						/>
						<Text className="text-xs text-muted-foreground" numberOfLines={1}>
							{place.postalCode ? `${place.postalCode} ${place.name}` : place.name}
						</Text>
					</View>

					<View className="flex-row items-center gap-1">
						<SymbolView
							name={{ ios: "calendar", android: "calendar_today" }}
							size={12}
							tintColor={mutedForeground}
						/>
						<Text className="text-xs text-muted-foreground">
							{new Date(createdAt).toLocaleDateString("de-DE", {
								day: "2-digit",
								month: "2-digit",
								timeZone: "Europe/Berlin",
							})}
						</Text>
					</View>
				</View>

				<View className="mt-2 items-start gap-3">
					<View className="rounded-full bg-category px-2 py-0.5">
						<Text
							className="font-medium text-xs text-category-foreground"
							numberOfLines={1}
						>
							{category.name}
						</Text>
					</View>

					{tags.length > 0 && (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerClassName="gap-1"
						>
							{tags.map((tag) => (
								<View
									key={tag.id}
									className="rounded-full border border-input px-2 py-0.5"
								>
									<Text className="font-medium text-xs text-foreground">
										{tag.name}
									</Text>
								</View>
							))}
						</ScrollView>
					)}
				</View>
			</View>
		</View>
	);
}

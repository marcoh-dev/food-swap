import {
	ENDING_SOON_DAYS,
	formatDate,
	getDaysUntil,
	getDeletionLabel,
	getEndDateLabel,
} from "@food-swap/shared/dates";
import { useLocalSearchParams } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";

import { useAuth } from "@/components/AuthProvider";
import { ListingImagePlaceholder } from "@/components/ListingImagePlaceholder";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useListing } from "@/hooks/useListing";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LISTING_STATUS_LABELS, LISTING_TYPE_ICONS, LISTING_TYPE_LABELS } from "@/lib/listing";

export default function ListingDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: listing } = useListing(id);
	const { isLoggedIn } = useAuth();
	const { data: currentUser } = useCurrentUser({ enabled: isLoggedIn });
	const foreground = useThemeColor("--foreground");
	const mutedForeground = useThemeColor("--muted-foreground");
	const destructive = useThemeColor("--destructive");

	if (!listing) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color={mutedForeground} />
			</View>
		);
	}

	const daysLeft = getDaysUntil(listing.endDate);
	const isExpired = daysLeft < 0;
	const isUnavailable = isExpired || listing.status === "deactivated";
	const endsSoon = daysLeft >= 0 && daysLeft <= ENDING_SOON_DAYS;
	const isOwner = isLoggedIn && currentUser?.id === listing.owner.id;
	const deletionLabel = isOwner ? getDeletionLabel(listing.endDate) : null;
	const statusLabel = LISTING_STATUS_LABELS[listing.status];
	const { place } = listing;

	// The scroll view must be the screen's first view, like on the tabs (iOS insets).
	return (
		<ScrollView
			className="bg-background"
			contentContainerClassName="pb-6"
			contentInsetAdjustmentBehavior="automatic"
		>
			<View className="aspect-square w-full bg-muted">
				{listing.image ? (
					<Image
						source={{ uri: listing.image }}
						className="absolute inset-0"
						resizeMode="cover"
						accessibilityLabel={listing.title}
					/>
				) : (
					<ListingImagePlaceholder />
				)}

				{isUnavailable && (
					<View className="absolute inset-0 items-center justify-center bg-gray-500/60 p-4">
						<Text className="text-center font-semibold text-white">
							Diese Anzeige ist nicht mehr verfügbar.
						</Text>
					</View>
				)}

				<View className="absolute inset-x-3 top-3 flex-row items-start justify-between gap-2">
					<View className="items-start gap-1">
						{isExpired && (
							<View className="rounded-full border border-border bg-muted px-2 py-0.5">
								<Text className="font-medium text-xs text-muted-foreground">
									Abgelaufen
								</Text>
							</View>
						)}
						{statusLabel && (
							<View className="rounded-full bg-primary px-2 py-0.5">
								<Text className="font-medium text-xs text-primary-foreground">
									{statusLabel}
								</Text>
							</View>
						)}
					</View>
					<View className="flex-row items-center gap-1 rounded-full bg-background px-2 py-0.5 shadow-sm">
						<SymbolView
							name={LISTING_TYPE_ICONS[listing.type]}
							size={12}
							tintColor={foreground}
						/>
						<Text className="font-medium text-xs text-foreground">
							{LISTING_TYPE_LABELS[listing.type]}
						</Text>
					</View>
				</View>

				{endsSoon && (
					<View className="absolute bottom-3 left-3 rounded-full bg-background px-2 py-0.5 shadow-sm">
						<Text className="font-medium text-xs text-foreground">
							{getEndDateLabel(daysLeft, listing.endDate)}
						</Text>
					</View>
				)}
			</View>

			<View className="gap-4 px-6 pt-5">
				<Text variant="h2">{listing.title}</Text>

				<View className="gap-2">
					<MetaRow
						icon={{ ios: "mappin", android: "location_on" }}
						color={mutedForeground}
					>
						{place.postalCode ? `${place.postalCode} ${place.name}` : place.name}
					</MetaRow>
					<MetaRow
						icon={{ ios: "calendar", android: "calendar_today" }}
						color={mutedForeground}
					>
						{`Eingestellt am ${formatDate(listing.createdAt)}`}
					</MetaRow>
					{isOwner && (
						<MetaRow icon={{ ios: "timer", android: "timer" }} color={mutedForeground}>
							{`Bis ${formatDate(listing.endDate)}`}
						</MetaRow>
					)}
					{deletionLabel && (
						<MetaRow
							icon={{ ios: "exclamationmark.circle", android: "error" }}
							color={destructive}
						>
							{deletionLabel}
						</MetaRow>
					)}
				</View>

				<View className="flex-row flex-wrap gap-1">
					<View className="rounded-full bg-category px-2 py-0.5">
						<Text className="font-medium text-xs text-category-foreground">
							{listing.category.name}
						</Text>
					</View>
					{listing.tags.map((tag) => (
						<View key={tag.id} className="rounded-full border border-input px-2 py-0.5">
							<Text className="font-medium text-xs text-foreground">{tag.name}</Text>
						</View>
					))}
				</View>

				<Text>{listing.description}</Text>

				<Text variant="muted">
					Angeboten von {listing.owner.name ?? listing.owner.username}
				</Text>
			</View>
		</ScrollView>
	);
}

function MetaRow({
	icon,
	color,
	children,
}: {
	icon: SymbolViewProps["name"];
	color: string | undefined;
	children: string;
}) {
	return (
		<View className="flex-row items-center gap-2">
			<SymbolView name={icon} size={16} tintColor={color} />
			<Text variant="muted" className="flex-1">
				{children}
			</Text>
		</View>
	);
}

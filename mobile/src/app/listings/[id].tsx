import {
	ENDING_SOON_DAYS,
	formatDate,
	getDaysUntil,
	getDeletionLabel,
	getEndDateLabel,
} from "@food-swap/shared/dates";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

import { listingChatQueryKey } from "@/api/chats";
import { LISTINGS_QUERY_KEY } from "@/api/listings";
import { isNotFoundError } from "@/api/request";
import { useAuth } from "@/components/AuthProvider";
import { ListingChatCard } from "@/components/ListingChatCard";
import { ListingImagePlaceholder } from "@/components/ListingImagePlaceholder";
import { OfflineNotice } from "@/components/OfflineNotice";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { StateScreen } from "@/components/StateScreen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useListing } from "@/hooks/useListing";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LISTING_STATUS_LABELS, LISTING_TYPE_ICONS, LISTING_TYPE_LABELS } from "@/lib/listing";
import { HOME_ROUTE } from "@/lib/routes";

export default function ListingDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	// Invalid IDs would get a 400 from the backend, which is retried like a server error.
	const isValidId = z.uuid().safeParse(id).success;
	const {
		data: listing,
		error,
		isError,
		isFetching,
		refetch,
	} = useListing(id, { enabled: isValidId });
	const isOnline = useIsOnline();
	const queryClient = useQueryClient();
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const { data: currentUser } = useCurrentUser({ enabled: isLoggedIn });
	const foreground = useThemeColor("--foreground");
	const mutedForeground = useThemeColor("--muted-foreground");
	const destructive = useThemeColor("--destructive");
	const card = useThemeColor("--card");
	const background = useThemeColor("--background");
	const insets = useSafeAreaInsets();
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refresh() {
		if (!isOnline) {
			return;
		}

		setIsRefreshing(true);
		// Also whether the user has a chat about it (e.g. started or deleted on the web)
		await Promise.all([
			refetch(),
			queryClient.invalidateQueries({ queryKey: listingChatQueryKey(id) }),
		]);
		setIsRefreshing(false);
	}

	const isNotFound = !isValidId || isNotFoundError(error);

	useEffect(() => {
		// The listing was deleted: reload the offers list so it's gone there too. Only the
		// list itself (exact), otherwise this query would be refetched and fail again.
		if (isNotFoundError(error)) {
			void queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY, exact: true });
		}
	}, [error, queryClient]);

	if (isNotFound) {
		return <ListingNotFound />;
	}

	const offlineNotice = !isOnline && (
		<OfflineNotice
			message={
				listing
					? "Das Angebot wird aktualisiert, sobald du wieder online bist."
					: "Das Angebot wird geladen, sobald du wieder online bist."
			}
		/>
	);
	const errorNotice = isOnline && isError && (
		<ServerErrorNotice
			message={
				listing
					? "Das Angebot konnte nicht aktualisiert werden."
					: "Das Angebot konnte nicht geladen werden."
			}
		>
			<Button
				variant="outline"
				className="self-start"
				disabled={isFetching}
				onPress={() => void refetch()}
			>
				<Text>Erneut versuchen</Text>
			</Button>
		</ServerErrorNotice>
	);

	if (!listing) {
		return (
			<StateScreen>
				{offlineNotice}
				{errorNotice}
				{isOnline && !isError && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={mutedForeground} />
					</View>
				)}
			</StateScreen>
		);
	}

	const daysLeft = getDaysUntil(listing.endDate);
	const isExpired = daysLeft < 0;
	const isUnavailable = isExpired || listing.status === "deactivated";
	const endsSoon = daysLeft >= 0 && daysLeft <= ENDING_SOON_DAYS;
	const isOwner = isLoggedIn && currentUser?.id === listing.owner.id;
	const deletionLabel = isOwner ? getDeletionLabel(listing.endDate) : null;
	const statusLabel = LISTING_STATUS_LABELS[listing.status];
	const ownerName = listing.owner.name ?? listing.owner.username;
	const { place } = listing;

	// The scroll view must be the screen's first view, like on the tabs (iOS insets).
	return (
		// Scrolls a focused text field (the message card) above the keyboard. A component from
		// another library, so it takes styles instead of className
		<KeyboardAwareScrollView
			style={{ backgroundColor: background }}
			// iOS adds the bottom inset itself (contentInsetAdjustmentBehavior), Android draws behind the navigation bar.
			contentContainerStyle={{
				paddingBottom: Platform.OS === "android" ? insets.bottom + 24 : 24,
			}}
			contentInsetAdjustmentBehavior="automatic"
			// Taps on buttons (e.g. sending a message) work while the keyboard is open
			keyboardShouldPersistTaps="handled"
			bottomOffset={16}
			// The keyboard covers the bottom inset, which the padding above already keeps room for
			extraKeyboardSpace={-insets.bottom}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={refresh}
					tintColor={mutedForeground}
					colors={mutedForeground ? [mutedForeground] : undefined}
					progressBackgroundColor={card}
				/>
			}
		>
			{(offlineNotice || errorNotice) && (
				<View className="gap-4 px-6 py-4">
					{offlineNotice}
					{errorNotice}
				</View>
			)}

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

				<Text variant="muted">Angeboten von {ownerName}</Text>

				{isLoggedIn && currentUser && !isOwner && (
					<ListingChatCard listingId={listing.id} ownerName={ownerName} />
				)}

				{!isLoggedIn && (
					<View className="gap-3 rounded-lg bg-muted p-4">
						<Text>Melde dich an, um {ownerName} zu schreiben.</Text>
						{/* The login modal closes with router.back(), so you're back here afterwards */}
						<Button
							variant="outline"
							className="self-start"
							onPress={() => router.push("/login")}
						>
							<Text>Anmelden</Text>
						</Button>
					</View>
				)}
			</View>
		</KeyboardAwareScrollView>
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

function ListingNotFound() {
	const router = useRouter();

	return (
		<StateScreen>
			<Text variant="h2">Angebot nicht gefunden</Text>
			<Text variant="muted">Dieses Angebot gibt es nicht oder nicht mehr.</Text>
			<Button className="self-start" onPress={() => router.dismissTo(HOME_ROUTE)}>
				<Text>Zu den Angeboten</Text>
			</Button>
		</StateScreen>
	);
}

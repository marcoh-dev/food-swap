import { formatPlace } from "@food-swap/shared/places";
import type { Place } from "@food-swap/shared/types";
import { SymbolView } from "expo-symbols";
import { useRef } from "react";
import { ActivityIndicator, Pressable, type TextInputInstance, View } from "react-native";

import { TextField } from "@/components/TextField";
import { Text } from "@/components/ui/text";
import { MIN_PLACE_QUERY_LENGTH, usePlaceSearch } from "@/hooks/usePlaceSearch";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

type Props = {
	query: string;
	selectedPlace: Place | null;
	description?: string;
	error?: string;
	onQueryChange: (query: string) => void;
	onSelect: (place: Place) => void;
};

function placeRegion(place: Place) {
	return place.county.startsWith(place.state) ? place.county : `${place.county}, ${place.state}`;
}

export function PlacePicker({
	query,
	selectedPlace,
	description,
	error,
	onQueryChange,
	onSelect,
}: Props) {
	const mutedForeground = useThemeColor("--muted-foreground");
	const inputRef = useRef<TextInputInstance>(null);
	const { search, isOutdated, dimResults } = usePlaceSearch(query, { enabled: !selectedPlace });
	const canSearch = !selectedPlace && query.trim().length >= MIN_PLACE_QUERY_LENGTH;
	const places = search.data ?? [];

	let results;
	if (search.isError) {
		results = <Text variant="muted">Orte konnten nicht geladen werden.</Text>;
	} else if (places.length > 0) {
		// Results for an earlier text stay visible, so the list doesn't jump while typing; dimmed
		// when the new ones take a while
		results = (
			<View
				className={cn(
					"overflow-hidden rounded-md border border-border",
					dimResults && "opacity-50",
				)}
			>
				{places.map((place, index) => (
					<Pressable
						key={place.id}
						onPress={() => onSelect(place)}
						accessibilityRole="button"
						className={cn(
							"px-3 py-2 active:bg-accent",
							index > 0 && "border-t border-border",
						)}
					>
						<Text>{formatPlace(place)}</Text>
						<Text variant="muted">{placeRegion(place)}</Text>
					</Pressable>
				))}
			</View>
		);
	} else if (search.fetchStatus === "paused") {
		// Offline, TanStack pauses the search and continues it once back online
		results = <Text variant="muted">Orte werden gesucht, sobald du wieder online bist.</Text>;
	} else if (search.isPending || isOutdated) {
		// "Nothing found" only for the current text, not for an earlier one
		results = <ActivityIndicator color={mutedForeground} />;
	} else {
		results = <Text variant="muted">Keinen Ort gefunden</Text>;
	}

	// The results come right below the field, before its description
	return (
		<TextField
			label="Ort"
			description={canSearch ? undefined : description}
			placeholder="PLZ oder Ort"
			ref={inputRef}
			value={query}
			onChangeText={onQueryChange}
			error={error}
			autoCorrect={false}
			autoComplete="off"
			accessory={
				query ? (
					<Pressable
						onPress={() => {
							onQueryChange("");
							// Ready to type a new place right away (iOS would otherwise leave the field)
							inputRef.current?.focus();
						}}
						accessibilityRole="button"
						accessibilityLabel="Ort löschen"
						hitSlop={8}
						className="h-10 w-11 items-center justify-center"
					>
						<SymbolView
							name={{ ios: "xmark.circle.fill", android: "cancel" }}
							size={18}
							tintColor={mutedForeground}
						/>
					</Pressable>
				) : undefined
			}
		>
			{canSearch && results}
		</TextField>
	);
}

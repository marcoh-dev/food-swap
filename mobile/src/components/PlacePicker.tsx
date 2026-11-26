import { formatPlace } from "@food-swap/shared/places";
import type { Place } from "@food-swap/shared/types";
import { ActivityIndicator, Pressable, View } from "react-native";

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
	const search = usePlaceSearch(query, { enabled: !selectedPlace });
	const canSearch = !selectedPlace && query.trim().length >= MIN_PLACE_QUERY_LENGTH;
	const places = search.data ?? [];

	let results;
	if (search.isError) {
		results = <Text variant="muted">Orte konnten nicht geladen werden.</Text>;
	} else if (places.length > 0) {
		// Results for an earlier text stay visible but dimmed until the new ones arrive, so the
		// list doesn't jump while typing
		results = (
			<View
				className={cn(
					"overflow-hidden rounded-md border border-border",
					search.isOutdated && "opacity-50",
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
	} else if (search.isPending || search.isOutdated) {
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
			value={query}
			onChangeText={onQueryChange}
			error={error}
			autoCorrect={false}
			autoComplete="off"
		>
			{canSearch && results}
		</TextField>
	);
}

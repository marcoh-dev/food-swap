import { formatPlace } from "@food-swap/shared/places";
import type { Place } from "@food-swap/shared/types";
import { ActivityIndicator, Pressable, View } from "react-native";

import { TextField } from "@/components/TextField";
import { Text } from "@/components/ui/text";
import { MIN_PLACE_QUERY_LENGTH, usePlaceSearch } from "@/hooks/usePlaceSearch";
import { useThemeColor } from "@/hooks/useThemeColor";

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

	return (
		<View className="gap-2">
			<TextField
				label="Ort"
				description={description}
				placeholder="PLZ oder Ort"
				value={query}
				onChangeText={onQueryChange}
				error={error}
				autoCorrect={false}
				autoComplete="off"
			/>
			{canSearch &&
				(search.isPending ? (
					<ActivityIndicator color={mutedForeground} />
				) : search.isError ? (
					<Text variant="muted">Orte konnten nicht geladen werden.</Text>
				) : places.length === 0 ? (
					<Text variant="muted">Keinen Ort gefunden</Text>
				) : (
					<View className="overflow-hidden rounded-md border border-border">
						{places.map((place, index) => (
							<Pressable
								key={place.id}
								onPress={() => onSelect(place)}
								accessibilityRole="button"
								className={`px-3 py-2 active:bg-accent ${index > 0 ? "border-t border-border" : ""}`}
							>
								<Text>{formatPlace(place)}</Text>
								<Text variant="muted">{placeRegion(place)}</Text>
							</Pressable>
						))}
					</View>
				))}
		</View>
	);
}

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PLACES_QUERY_KEY, searchPlaces } from "@/api/places";

export const MIN_PLACE_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 150;
// Shorter waits would only make the list flicker while typing
const DIM_AFTER_MS = 300;

/**
 * Searches places once the user stops typing for a moment. `isOutdated`: the results belong to an
 * earlier text (still waiting for the pause, or the previous results are shown while loading).
 * `dimResults`: outdated for longer than DIM_AFTER_MS, so fast answers don't dim the list.
 * `search` is returned as is, not spread: TanStack only re-renders for the properties that are read.
 */
export function usePlaceSearch(query: string, { enabled = true } = {}) {
	const trimmedQuery = query.trim();
	const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedQuery(trimmedQuery), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [trimmedQuery]);

	const search = useQuery({
		queryKey: [...PLACES_QUERY_KEY, debouncedQuery],
		queryFn: ({ signal }) => searchPlaces(debouncedQuery, signal),
		enabled: enabled && debouncedQuery.length >= MIN_PLACE_QUERY_LENGTH,
		placeholderData: keepPreviousData,
	});

	const isOutdated = debouncedQuery !== trimmedQuery || search.isPlaceholderData;
	// The text whose search has been outdated for longer than DIM_AFTER_MS
	const [slowQuery, setSlowQuery] = useState<string | null>(null);

	useEffect(() => {
		if (!isOutdated) return;

		const timeout = setTimeout(() => setSlowQuery(trimmedQuery), DIM_AFTER_MS);
		return () => clearTimeout(timeout);
	}, [isOutdated, trimmedQuery]);

	return { search, isOutdated, dimResults: isOutdated && slowQuery === trimmedQuery };
}

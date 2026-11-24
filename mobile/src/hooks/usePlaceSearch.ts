import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PLACES_QUERY_KEY, searchPlaces } from "@/api/places";

export const MIN_PLACE_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 150;

/** Searches places once the user stops typing for a moment. */
export function usePlaceSearch(query: string, { enabled = true } = {}) {
	const trimmedQuery = query.trim();
	const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedQuery(trimmedQuery), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [trimmedQuery]);

	return useQuery({
		queryKey: [...PLACES_QUERY_KEY, debouncedQuery],
		queryFn: ({ signal }) => searchPlaces(debouncedQuery, signal),
		enabled: enabled && debouncedQuery.length >= MIN_PLACE_QUERY_LENGTH,
		placeholderData: keepPreviousData,
	});
}

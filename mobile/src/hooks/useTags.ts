import { useQuery } from "@tanstack/react-query";

import { fetchTags, TAGS_QUERY_KEY } from "@/api/tags";

export function useTags() {
	return useQuery({
		queryKey: TAGS_QUERY_KEY,
		queryFn: ({ signal }) => fetchTags(signal),
	});
}

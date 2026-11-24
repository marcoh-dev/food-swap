import { useQuery } from "@tanstack/react-query";

import { CATEGORIES_QUERY_KEY, fetchCategories } from "@/api/categories";

export function useCategories() {
	return useQuery({
		queryKey: CATEGORIES_QUERY_KEY,
		queryFn: ({ signal }) => fetchCategories(signal),
	});
}

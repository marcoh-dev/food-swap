import type { Category } from "@food-swap/shared/types";

import { Badge } from "@/components/ui/badge";

export default function CategoryBadge({ category }: { category: Category | null }) {
	if (!category) return null;

	return (
		<Badge className="truncate" variant="category">
			{category.name}
		</Badge>
	);
}

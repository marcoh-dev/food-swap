import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types/category.types";

export default function CategoryBadge({ category }: { category: Category | null }) {
	if (!category) return null;

	return (
		<Badge className="truncate" variant="category">
			{category.name}
		</Badge>
	);
}

import type { Category } from "@/lib/types/category.types";
import { Badge } from "../ui/badge";

export default function CategoryBadge({ category }: { category: Category | null }) {
	if (!category) return null;

	return (
		<Badge className="rounded-full truncate" variant="category">
			{category.name}
		</Badge>
	);
}

import type { Category } from "@/lib/types/category.types";
import { Badge } from "../ui/badge";

export default function CategoryBadge({
  category,
}: {
  category: Category | null;
}) {
  if (!category) return null;

  return (
    <Badge className="rounded-full mt-1 px-2.5 py-0.5 text-xs">
      {category.name}
    </Badge>
  );
}

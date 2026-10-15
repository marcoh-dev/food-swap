import { Category } from "@/lib/types/category.types";

export default function CategoryBadge({
  category,
}: {
  category: Category | null;
}) {
  if (!category) return null;

  return (
    <span className="rounded-full bg-gray-300 dark:bg-gray-700 px-2.5 py-0.5 text-xs">
      {category.name}
    </span>
  );
}

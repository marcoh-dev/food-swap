import type { Tag } from "@/lib/types/tag.types";

type Props = {
  tags: Tag[];
  max?: number;
};

export default function TagList({ tags, max }: Props) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const hidden = tags.length - visible.length;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {visible.map((tag) => (
        <li
          key={tag.id}
          className="rounded-full border border-gray-400 dark:border-gray-500 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300"
        >
          {tag.name}
        </li>
      ))}
      {hidden > 0 && (
        <li className="px-1 py-0.5 text-xs text-gray-500">+{hidden}</li>
      )}
    </ul>
  );
}

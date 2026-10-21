import type { Tag } from "@/lib/types/tag.types";
import { Badge } from "../ui/badge";

type Props = {
	tags: Tag[];
	max?: number;
};

export default function TagList({ tags, max }: Props) {
	if (tags.length === 0) return null;

	const visible = max ? tags.slice(0, max) : tags;
	const hidden = tags.length - visible.length;

	return (
		<ul className="flex flex-wrap gap-1.5" aria-label="Tags">
			{visible.map((tag) => (
				<li key={tag.id}>
					<Badge variant="tag" className="rounded-full">
						{tag.name}
					</Badge>
				</li>
			))}
			{hidden > 0 && (
				<li className="px-1 py-0.5 text-xs text-muted-foreground">
					<span aria-hidden="true">+{hidden}</span>
					<span className="sr-only">{hidden} weitere Tags</span>
				</li>
			)}
		</ul>
	);
}

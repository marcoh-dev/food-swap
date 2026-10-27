import type { Tag } from "@/lib/types/tag.types";
import { Badge } from "../ui/badge";

type Props = {
	tags: Tag[];
	max?: number;
	mobileMax?: number;
};

export default function TagList({ tags, max, mobileMax }: Props) {
	if (tags.length === 0) return null;

	const visible = max ? tags.slice(0, max) : tags;
	const mobileCount = Math.min(mobileMax ?? visible.length, visible.length);
	const hidden = tags.length - visible.length;
	const hiddenMobile = tags.length - mobileCount;

	return (
		<ul className="flex flex-wrap gap-1.5" aria-label="Tags">
			{visible.map((tag, i) => (
				<li key={tag.id} className={i >= mobileCount ? "hidden sm:block" : undefined}>
					<Badge variant="tag" className="rounded-full">
						{tag.name}
					</Badge>
				</li>
			))}
			{hiddenMobile > 0 && (
				<li className="px-1 py-0.5 text-xs text-muted-foreground sm:hidden">
					<span aria-hidden="true">+{hiddenMobile}</span>
					<span className="sr-only">{hiddenMobile} weitere Tags</span>
				</li>
			)}
			{hidden > 0 && (
				<li className="hidden px-1 py-0.5 text-xs text-muted-foreground sm:block">
					<span aria-hidden="true">+{hidden}</span>
					<span className="sr-only">{hidden} weitere Tags</span>
				</li>
			)}
		</ul>
	);
}

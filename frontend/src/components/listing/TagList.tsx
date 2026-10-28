import type { Tag } from "@/lib/types/tag.types";
import { Badge } from "../ui/badge";
import { cn } from "cn";

const BREAKPOINTS = ["base", "sm", "md", "lg", "xl"] as const;
type Breakpoint = (typeof BREAKPOINTS)[number];

// Static class names so Tailwind can pick them up
const HIDE: Record<Breakpoint, string> = {
	base: "hidden",
	sm: "sm:hidden",
	md: "md:hidden",
	lg: "lg:hidden",
	xl: "xl:hidden",
};
const SHOW: Record<Breakpoint, string> = {
	base: "",
	sm: "sm:block",
	md: "md:block",
	lg: "lg:block",
	xl: "xl:block",
};

type ResponsiveMax = Partial<Record<Breakpoint, number>>;

type Props = {
	tags: Tag[];
	max?: number | ResponsiveMax;
	scrollable?: boolean;
};

function resolveMax(config: ResponsiveMax, total: number): Record<Breakpoint, number> {
	let current = total;
	return Object.fromEntries(
		BREAKPOINTS.map((bp) => {
			current = Math.min(config[bp] ?? current, total);
			return [bp, current];
		}),
	) as Record<Breakpoint, number>;
}

function visibilityClasses(isVisible: (bp: Breakpoint) => boolean) {
	let prev = true;
	return cn(
		BREAKPOINTS.map((bp) => {
			const visible = isVisible(bp);
			if (visible === prev) return null;
			prev = visible;
			return visible ? SHOW[bp] : HIDE[bp];
		}),
	);
}

export default function TagList({ tags, max, scrollable = false }: Props) {
	if (tags.length === 0) return null;

	const config: ResponsiveMax = typeof max === "number" ? { base: max } : (max ?? {});
	const limits = resolveMax(
		scrollable ? { ...config, base: undefined, sm: config.sm ?? config.base } : config,
		tags.length,
	);
	const hiddenCounts = [...new Set(BREAKPOINTS.map((bp) => tags.length - limits[bp]))].filter(
		(count) => count > 0,
	);

	return (
		<ul
			className={cn(
				"flex flex-wrap gap-1.5",
				scrollable &&
					// contain-inline-size keeps the unwrapped row from widening its parents
					"no-scrollbar w-full flex-nowrap overflow-x-auto overscroll-x-contain contain-inline-size sm:flex-wrap sm:overflow-visible",
			)}
			aria-label="Tags"
		>
			{tags.map((tag, i) => {
				if (BREAKPOINTS.every((bp) => i >= limits[bp])) return null;
				return (
					<li
						key={tag.id}
						className={
							cn(
								scrollable && "shrink-0",
								visibilityClasses((bp) => i < limits[bp]),
							) || undefined
						}
					>
						<Badge variant="tag" className="rounded-full">
							{tag.name}
						</Badge>
					</li>
				);
			})}
			{hiddenCounts.map((count) => (
				<li
					key={count}
					className={cn(
						"px-1 py-0.5 text-xs text-muted-foreground",
						visibilityClasses((bp) => tags.length - limits[bp] === count),
					)}
				>
					<span aria-hidden="true">+{count}</span>
					<span className="sr-only">{count} weitere Tags</span>
				</li>
			))}
		</ul>
	);
}

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/lib/types/tag.types";

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

	const rows = scrollable && tags.length > 2;
	// <ul> can't contain the row wrappers, so items become divs with role=listitem
	const Item = rows ? "div" : "li";
	const itemRole = rows ? "listitem" : undefined;

	const items = tags.map((tag, i) => {
		if (BREAKPOINTS.every((bp) => i >= limits[bp])) return null;
		return (
			<Item
				key={tag.id}
				role={itemRole}
				className={
					cn(
						rows ? "shrink-0" : "max-w-full",
						visibilityClasses((bp) => i < limits[bp]),
					) || undefined
				}
			>
				<Badge variant="tag" className="max-w-full rounded-full">
					{tag.name}
				</Badge>
			</Item>
		);
	});
	const counters = hiddenCounts.map((count) => (
		<Item
			key={count}
			role={itemRole}
			className={cn(
				"px-1 py-0.5 text-xs text-muted-foreground",
				visibilityClasses((bp) => tags.length - limits[bp] === count),
			)}
		>
			<span aria-hidden="true">+{count}</span>
			<span className="sr-only">{count} weitere Tags</span>
		</Item>
	));

	if (!rows) {
		return (
			<ul className="flex flex-wrap gap-1" aria-label="Tags">
				{items}
				{counters}
			</ul>
		);
	}

	const split = Math.ceil(tags.length / 2);
	const rowClassName = "flex w-max gap-1 sm:contents";
	return (
		<div
			role="list"
			aria-label="Tags"
			className={cn(
				"no-scrollbar flex w-full flex-col gap-1 overflow-x-auto overscroll-x-contain contain-inline-size",
				"sm:flex-row sm:flex-wrap sm:overflow-visible",
			)}
		>
			<div role="none" className={rowClassName}>
				{items.slice(0, split)}
			</div>
			{split < tags.length && (
				<div role="none" className={rowClassName}>
					{items.slice(split)}
				</div>
			)}
			{counters}
		</div>
	);
}

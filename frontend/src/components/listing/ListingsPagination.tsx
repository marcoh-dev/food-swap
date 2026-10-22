import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
	page: number;
	totalPages: number;
	searchParams: Record<string, string | undefined>;
};

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
	const pages: (number | "ellipsis")[] = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
			pages.push(i);
		} else if (pages.at(-1) !== "ellipsis") {
			pages.push("ellipsis");
		}
	}
	return pages;
}

export default function ListingsPagination({ page, totalPages, searchParams }: Props) {
	if (totalPages <= 1) return null;

	function hrefFor(target: number) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) query.set(key, value);
		}
		query.set("page", String(target));
		return `?${query.toString()}`;
	}

	return (
		<Pagination className="mt-8">
			<PaginationContent>
				{page > 1 && (
					<PaginationItem>
						<PaginationPrevious href={hrefFor(page - 1)} />
					</PaginationItem>
				)}

				{getPageNumbers(page, totalPages).map((entry, index) =>
					entry === "ellipsis" ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={entry}>
							<PaginationLink href={hrefFor(entry)} isActive={entry === page}>
								{entry}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				{page < totalPages && (
					<PaginationItem>
						<PaginationNext href={hrefFor(page + 1)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}

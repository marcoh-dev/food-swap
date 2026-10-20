import type { Tag } from "./types/tag.types";

export async function getTags(): Promise<Tag[]> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/tags`, {
		next: { revalidate: 3600 },
	});
	if (!res.ok) throw new Error("Tags konnten nicht geladen werden");
	return res.json();
}

import { Category } from "./types/category.types";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/categories`,
    {
      next: { revalidate: 3600 },
    },
  );
  if (!res.ok) throw new Error("Kategorien konnten nicht geladen werden");
  return res.json();
}

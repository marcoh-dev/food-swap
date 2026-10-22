import { z } from "zod";
import { validateEndDate } from "@/utils/date";
import { MISSING_PLACE_MESSAGE } from "@/lib/constants/listing.constants";

const imageUrlSchema = z.url({ protocol: /^https?$/ });

function isEmptyOrImageUrl(value: string): boolean {
	return value === "" || imageUrlSchema.safeParse(value).success;
}

export function createListingSchema(originalEndDate?: string) {
	return z.object({
		title: z
			.string()
			.trim()
			.min(1, "Bitte gib einen Namen ein.")
			.max(100, "Der Name darf höchstens 100 Zeichen lang sein."),
		description: z
			.string()
			.trim()
			.min(1, "Bitte gib eine Beschreibung ein.")
			.max(2000, "Die Beschreibung darf höchstens 2000 Zeichen lang sein."),
		image: z
			.string()
			.trim()
			.max(500, "Die URL darf höchstens 500 Zeichen lang sein.")
			.refine(isEmptyOrImageUrl, "Bitte gib eine gültige URL ein."),
		placeId: z.string().min(1, MISSING_PLACE_MESSAGE),
		categoryId: z.string().min(1, "Bitte wähle eine Kategorie."),
		type: z.enum(["swap", "giveaway"], "Bitte wähle eine Art."),
		tagIds: z.array(z.string()),
		endDate: z.string().superRefine((value, context) => {
			if (value === originalEndDate) return;

			const result = validateEndDate(value);
			if (!result.ok) context.addIssue({ code: "custom", message: result.error });
		}),
	});
}

export type ListingFormValues = z.infer<ReturnType<typeof createListingSchema>>;

import type { ActionResult } from "@/lib/types/common.types";

/**
 * Returns the data of a server action, or throws its error text, so TanStack Query treats it as
 * an error. The actions turn backend errors into texts; this adds the one for when they can't run.
 */
export async function fromAction<T>(action: Promise<ActionResult<T>>): Promise<T> {
	let result: ActionResult<T>;
	try {
		result = await action;
	} catch {
		throw new Error("Der Server ist nicht erreichbar. Versuche es später nochmal.");
	}

	if (result.error !== undefined) throw new Error(result.error);
	return result.data;
}

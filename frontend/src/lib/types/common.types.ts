export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export type FormState = {
	error?: string;
	fieldErrors?: Record<string, string[] | undefined>;
};

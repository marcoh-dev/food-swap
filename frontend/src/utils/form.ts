import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { FormState } from "@/lib/types/common.types";

export function applyServerErrors<TValues extends FieldValues>(
	setError: UseFormSetError<TValues>,
	result: FormState,
) {
	const fieldErrors = Object.entries(result.fieldErrors ?? {});

	fieldErrors.forEach(([field, messages], index) => {
		if (!messages?.length) return;

		setError(field as Path<TValues>, { message: messages[0] }, { shouldFocus: index === 0 });
	});

	if (result.error) {
		setError("root", { message: result.error });
	}
}

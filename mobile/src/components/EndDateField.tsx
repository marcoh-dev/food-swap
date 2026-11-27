import {
	getDefaultEndDay,
	getMaxEndDay,
	getMinEndDay,
	parseEndDate,
	toLocalDate,
} from "@food-swap/shared/endDate";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export type EndDatePickerProps = {
	label: string;
	/** "YYYY-MM-DD", or "" while no day was picked (the default day is shown, but not stored). */
	value: string;
	onChange: (value: string) => void;
	error?: string;
};

/**
 * The day to show and the limits to pick from, like on the web. Without a valid value the default
 * day is shown. The limits are Berlin days, the pickers work with local dates.
 */
export function useEndDateRange(value: string) {
	const shownDay = parseEndDate(value).status === "valid" ? value : getDefaultEndDay();

	return {
		shownDay,
		shownDate: toLocalDate(shownDay),
		minimumDate: toLocalDate(getMinEndDay()),
		maximumDate: toLocalDate(getMaxEndDay()),
	};
}

type FieldProps = {
	label: string;
	error?: string;
	children: ReactNode;
};

/** The label above and the error text below an end date picker, the same on iOS and Android. */
export function EndDateField({ label, error, children }: FieldProps) {
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			{children}
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

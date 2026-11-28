import { formatDay, formatIsoDate } from "@food-swap/shared/endDate";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Keyboard, Pressable } from "react-native";

import { EndDateField, type EndDatePickerProps, useEndDateRange } from "@/components/EndDateField";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Android: a box that opens the system date dialog. iOS has its own picker. */
export function EndDatePicker({ label, value, onChange, error }: EndDatePickerProps) {
	const { shownDay, shownDate, minimumDate, maximumDate } = useEndDateRange(value);

	function handlePress() {
		Keyboard.dismiss();

		DateTimePickerAndroid.open({
			value: shownDate,
			mode: "date",
			minimumDate,
			maximumDate,
			onValueChange: (_event, selected) => onChange(formatIsoDate(selected)),
		});
	}

	return (
		<EndDateField label={label} error={error}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={label}
				accessibilityValue={{ text: formatDay(shownDay) }}
				onPress={handlePress}
				className={cn(
					"h-10 w-full justify-center rounded-md border border-input bg-background px-3 shadow-sm shadow-black/5 dark:bg-input/30",
					error && "border-destructive",
				)}
			>
				<Text>{formatDay(shownDay)}</Text>
			</Pressable>
		</EndDateField>
	);
}

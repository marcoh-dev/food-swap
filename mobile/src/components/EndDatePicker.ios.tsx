import { DatePicker, Host } from "@expo/ui/swift-ui";
import { accessibilityLabel, datePickerStyle } from "@expo/ui/swift-ui/modifiers";
import { formatIsoDate } from "@food-swap/shared/endDate";

import { EndDateField, type EndDatePickerProps, useEndDateRange } from "@/components/EndDateField";

/** iOS: the native date picker; it opens its calendar when tapped. */
export function EndDatePicker({ label, value, onChange, error }: EndDatePickerProps) {
	const { shownDate, minimumDate, maximumDate } = useEndDateRange(value);

	return (
		<EndDateField label={label} error={error}>
			<Host matchContents>
				<DatePicker
					selection={shownDate}
					range={{ start: minimumDate, end: maximumDate }}
					displayedComponents={["date"]}
					onDateChange={(date) => onChange(formatIsoDate(date))}
					modifiers={[datePickerStyle("compact"), accessibilityLabel(label)]}
				/>
			</Host>
		</EndDateField>
	);
}

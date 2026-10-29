"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	formatDay,
	formatIsoDate,
	getDefaultEndDay,
	getMaxEndDay,
	getMinEndDay,
	parseEndDate,
	toLocalDate,
} from "@/utils/date";

type Props = {
	value: string;
	onChange: (value: string) => void;
	ref?: React.Ref<HTMLButtonElement>;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
};

export default function EndDatePicker({ value, onChange, ref, ...ariaProps }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const parsedDate = parseEndDate(value);
	const date = parsedDate.status === "valid" ? parsedDate.date : undefined;

	function handleSelect(selectedDate: Date | undefined) {
		onChange(selectedDate ? formatIsoDate(selectedDate) : "");
		setIsOpen(false);
	}
	const label = formatDay(date ? value : getDefaultEndDay());
	const minDate = toLocalDate(getMinEndDay());
	const maxDate = toLocalDate(getMaxEndDay());

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					ref={ref}
					type="button"
					variant="outline"
					// as wide as the calendar: 7 cells of --spacing(7) plus its p-2
					className="w-full max-w-53 justify-start rounded-sm"
					{...ariaProps}
				>
					<CalendarIcon className="size-4" aria-hidden="true" /> {label}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleSelect}
					disabled={{ before: minDate, after: maxDate }}
				/>
			</PopoverContent>
		</Popover>
	);
}

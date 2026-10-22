"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import {
	getMinEndDate,
	getMaxEndDate,
	getDefaultEndDate,
	formatDate,
	formatIsoDate,
	parseEndDate,
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
	const label = date
		? formatDate(date.toISOString())
		: formatDate(getDefaultEndDate().toISOString());

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					ref={ref}
					type="button"
					variant="outline"
					className="w-full justify-start"
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
					disabled={{ before: getMinEndDate(), after: getMaxEndDate() }}
				/>
			</PopoverContent>
		</Popover>
	);
}

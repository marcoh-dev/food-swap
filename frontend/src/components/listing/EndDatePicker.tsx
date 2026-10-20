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
} from "@/utils/date";

type Props = {
	defaultValue?: string;
};

export default function EndDatePicker({ defaultValue }: Props) {
	const [date, setDate] = useState<Date | undefined>(
		defaultValue ? new Date(defaultValue) : undefined,
	);

	const [isOpen, setIsOpen] = useState(false);
	function handleSelect(selectedDate: Date | undefined) {
		setDate(selectedDate);
		setIsOpen(false);
	}
	const label = date
		? formatDate(date.toISOString())
		: `Standard: ${formatDate(getDefaultEndDate().toISOString())}`;

	return (
		<>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button type="button" variant="outline" className="w-full justify-start">
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
			<input type="hidden" name="endDate" value={date ? formatIsoDate(date) : ""} />
		</>
	);
}

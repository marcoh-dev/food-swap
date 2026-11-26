import { useState } from "react";

import { SelectField, type SelectProps, SelectTrigger } from "@/components/SelectField";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";

/** Android and web: a dropdown below the field, as wide as the field. iOS has its own menu. */
export function Select({ label, options, value, onValueChange, placeholder, error }: SelectProps) {
	const [width, setWidth] = useState<number>();
	const selected = options.find((option) => option.value === value);

	return (
		<SelectField label={label} error={error}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SelectTrigger
						label={label}
						selectedLabel={selected?.label}
						placeholder={placeholder}
						error={error}
						onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent style={{ width }}>
					<DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
						{options.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								<Text>{option.label}</Text>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</SelectField>
	);
}

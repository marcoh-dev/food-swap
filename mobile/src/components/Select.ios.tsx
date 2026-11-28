import { Host, Menu, Picker, RNHostView, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { accessibilityLabel, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { View } from "react-native";

import { SelectField, type SelectProps, SelectTrigger } from "@/components/SelectField";

/** iOS: the native menu, opened by the same box as the dropdown on Android. */
export function Select({ label, options, value, onValueChange, placeholder, error }: SelectProps) {
	// The box inside the native menu needs the field's width, because a menu label is only as wide
	// as its content
	const [width, setWidth] = useState<number>();
	const selected = options.find((option) => option.value === value);

	return (
		<SelectField label={label} error={error}>
			<View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
				<Host matchContents>
					<Menu
						label={
							<RNHostView matchContents>
								{/* SwiftUI handles the tap; the box is only the look */}
								<View pointerEvents="none">
									<SelectTrigger
										label={label}
										selectedLabel={selected?.label}
										placeholder={placeholder}
										error={error}
										style={{ width }}
									/>
								</View>
							</RNHostView>
						}
						modifiers={[
							accessibilityLabel(`${label}: ${selected?.label ?? placeholder ?? ""}`),
						]}
					>
						{/* An inline picker shows the options with a checkmark on the chosen one */}
						<Picker
							selection={value}
							onSelectionChange={onValueChange}
							modifiers={[pickerStyle("inline")]}
						>
							{options.map((option) => (
								<SwiftUIText key={option.value} modifiers={[tag(option.value)]}>
									{option.label}
								</SwiftUIText>
							))}
						</Picker>
					</Menu>
				</Host>
			</View>
		</SelectField>
	);
}

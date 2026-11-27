import { useState } from "react";
import { Keyboard, View } from "react-native";

import { TermSearch } from "@/components/search/TermSearch";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export type Search = {
	term: string;
};

type Props = {
	onSearch: (search: Search) => void;
};

export function SearchBar({ onSearch }: Props) {
	const [termInput, setTermInput] = useState("");

	function submitSearch() {
		onSearch({ term: termInput.trim() });
		Keyboard.dismiss();
	}

	function clearSearch() {
		setTermInput("");
		onSearch({ term: "" });
	}

	return (
		<View className="gap-2">
			<TermSearch
				value={termInput}
				onChangeText={setTermInput}
				onSubmit={submitSearch}
				onClear={clearSearch}
			/>
			<Button onPress={submitSearch}>
				<Text>Suchen</Text>
			</Button>
		</View>
	);
}

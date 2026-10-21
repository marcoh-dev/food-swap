import SearchBar from "@/components/search/SearchBar";
import { pageTitles } from "@/lib/constants/titles.constants";
import type { Metadata } from "next";

export default function Home() {
	return (
		<>
			<SearchBar />
			<main>
				<h2 className="text-h2">Welcome to FoodSwap!</h2>
				<p>Share what you have, find what you need.</p>
			</main>
		</>
	);
}

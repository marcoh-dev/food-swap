import SearchBar from "@/components/search/SearchBar";

export default function Home() {
	return (
		<>
			<SearchBar />
			<main className="mt-4">
				<h2 className="text-h2">Willkommen bei FoodSwap!</h2>
				<p>Teile, was du hast.<br>Finde, was du brauchst.</p>
			</main>
		</>
	);
}

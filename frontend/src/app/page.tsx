import SearchBar from "@/components/Search/SearchBar";

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

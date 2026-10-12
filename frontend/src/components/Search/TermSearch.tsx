export default function TermSearch() {
  return (
    <div className="grid gap-0.5">
      <input
        type="search"
        name="term"
        aria-label="Suchbegriff"
        placeholder="🔍"
        className="border-2 border-gray-300 rounded-lg px-3 py-2"
      />
    </div>
  );
}

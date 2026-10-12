import LocationSearch from "./LocationSearch";
import RadiusSearch from "./RadiusSearch";
import TermSearch from "./TermSearch";

export default function SearchBar() {
  return (
    <form role="search" className="p-[1em]" action={searchAction}>
      <div className="flex flex-col gap-3">
        <TermSearch />
        <LocationSearch />
        <RadiusSearch />
        <button
          type="submit"
          className="w-full rounded-lg bg-gray-300 px-3 py-2 transition-colors hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus-visible:outline-gray-300"
        >
          Suchen
        </button>
      </div>
    </form>
  );
}

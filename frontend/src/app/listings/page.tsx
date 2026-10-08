import { getListings } from "@/lib/listings.service";

export default async function ListingsPage() {
  const listings = await getListings();
  if (listings.length === 0) {
    return <p>Noch keine Eintraege.</p>;
  }
  return (
    <ul className="flex flex-col gap-3 my-4">
      {listings.map((listing) => (
        <li
          key={listing.id}
          className="border-2 border-gray-300 rounded-lg px-3 py-2"
        >
          <p className="font-semibold">{listing.name}</p>
          <p>{listing.description}</p>
          <p className="text-sm text-gray-500">
            {listing.location} ·{" "}
            {listing.type === "tauschen" ? "Tauschen" : "Verschenken"}
          </p>
        </li>
      ))}
    </ul>
  );
}

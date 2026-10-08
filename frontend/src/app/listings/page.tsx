import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";

export default async function ListingsPage() {
  const listings = await getListings();
  if (listings.length === 0) {
    return <p>Noch keine Eintraege.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-12">
      {listings.map((listing) => (
        <li
          key={listing.id}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 basis-1/2 bg-gray-200"
        >
          <Link href={`/listings/${listing.id}`} className="no-underline">
            <Image
              width={450}
              height={400}
              src="/placeholder.png"
              alt="placeholder image"
            ></Image>
            <h2 className="text-h2">{listing.name}</h2>
            <p className="text-body">{listing.description}</p>
            <p className="text-sm text-gray-500">
              {listing.location} ·{" "}
              {listing.type === "tauschen" ? "Tauschen" : "Verschenken"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

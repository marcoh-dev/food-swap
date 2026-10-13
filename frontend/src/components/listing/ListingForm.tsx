import { NewListing } from "@/lib/types/listing.types";

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: NewListing;
  submitLabel?: string;
};

export default function ListingForm({
  action,
  defaultValues,
  submitLabel = "Erstellen",
}: Props) {
  return (
    <form className="my-4" action={action}>
      <div className="flex flex-col gap-3">
        <div className="grid gap-0.5">
          <label htmlFor="title">Name</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Tomaten"
            defaultValue={defaultValues?.title}
            required
            className="border-2 border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid gap-0.5">
          <label htmlFor="description">Beschreibung</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="3 Tomaten von meiner Ernte…"
            defaultValue={defaultValues?.description}
            required
            className="border-2 border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid gap-0.5">
          <label htmlFor="image">Bild(URL)</label>
          <input
            id="image"
            name="image"
            type="text"
            placeholder="https://placeholder.png"
            defaultValue={defaultValues?.image ?? ""}
            className="border-2 border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid gap-0.5">
          <label htmlFor="location">Ort</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Hamburg"
            defaultValue={defaultValues?.location}
            required
            className="border-2 border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <fieldset className="grid gap-1">
          <legend>Art</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="swap"
              defaultChecked={defaultValues?.type === "swap"}
              required
            />
            Tauschen
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="giveaway"
              defaultChecked={defaultValues?.type === "giveaway"}
            />
            Verschenken
          </label>
        </fieldset>
      </div>
      <button
        type="submit"
        className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2 mt-5 w-full"
      >
        {submitLabel}
      </button>
    </form>
  );
}

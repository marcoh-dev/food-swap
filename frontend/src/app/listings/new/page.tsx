import { createListingAction } from "@/app/action";

export default async function NewListingPage() {
  return (
    <>
      <form className="my-4" action={createListingAction}>
        <div className="flex flex-col gap-3">
          <div className="grid gap-0.5">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Tomaten"
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
              required
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
              required

              className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <fieldset className="grid gap-1">
            <legend>Art</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="tauschen" required />
              Tauschen
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="verschenken" />
              Verschenken
            </label>
          </fieldset>
        </div>
        <div className="flex-col gap-3">
          <button
            type="submit"
            className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2 mt-5 w-full"
          >
            Erstellen
          </button>
        </div>
      </form>
    </>
  );
}

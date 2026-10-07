import Link from "next/link";

export default function listingForm() {
  return (
    <>
      <form className="my-4">
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
            <label htmlFor="beschreibung">Beschreibung</label>
            <input
              id="beschreibung"
              name="beschreibung"
              type="text"
              placeholder="3 Tomaten über von meiner Ernte…"
              required
              className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid gap-0.5">
            <label htmlFor="ort">Ort</label>
            <input
              id="ort"
              name="ort"
              type="text"
              placeholder="Hamburg"
              required

              className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <fieldset className="grid gap-1">
            <legend>Art</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="art" value="tauschen" required />
              Tauschen
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="art" value="verschenken" />
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

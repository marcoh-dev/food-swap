import { updateUserAction } from "@/app/actions";

export function UserUpdate({ currentName }: { currentName?: string }) {
  return (
    <section className="mt-8">
      <form className="my-4" action={updateUserAction}>
        <div className="flex flex-col gap-3">
          <div className="grid gap-0.5">
            <label htmlFor="name">Profilname</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wähle hier den Namen, unter dem andere User dich sehen können.
            </p>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="z. B. Tomato "
              defaultValue={currentName}
              required
              className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-gray-300 px-3 py-2 transition-colors hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus-visible:outline-gray-300"
          >
            Speichern
          </button>
        </div>
      </form>
    </section>
  );
}

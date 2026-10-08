import { deleteUserAction } from "@/app/actions";

export function UserDelete() {
  return (
    <section className="mt-10 border-t-2 border-gray-300 pt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Dieser Schritt kann nicht rückgängig gemacht werden.
      </p>{" "}
      <form action={deleteUserAction}>
        <button
          type="submit"
          className="mt-3 rounded-lg border-2 border-red-700 bg-transparent px-3 py-2 text-red-700 hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-700 dark:hover:text-white"
        >
          Konto löschen
        </button>
      </form>
    </section>
  );
}

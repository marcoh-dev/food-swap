"use client";

import { useState } from "react";
import { deleteUserAction } from "@/app/actions";

export function UserDelete() {
  const [isConfirming, setIsConfirming] = useState(false);

  function handleConfirm() {
    setIsConfirming(true);
  }

  function handleCancel() {
    setIsConfirming(false);
  }
  return (
    <section className="mt-10 border-t-2 border-gray-300 pt-6">
      {isConfirming ? (
        <div role="alertdialog" aria-labelledby="delete-warning">
          <p id="delete-warning" className="my-2 text-sm">
            Dieser Schritt kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 rounded-lg bg-gray-300 px-3 py-2 transition-colors hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus-visible:outline-gray-300"
            >
              Abbrechen
            </button>
            <form action={deleteUserAction}>
              <button
                type="submit"
                className="mt-3 rounded-lg border-2 border-red-700 bg-transparent px-3 py-2 text-red-700 hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-700 dark:hover:text-white"
              >
                Endgültig löschen
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleConfirm}
          className="mt-3 rounded-lg border-2 border-red-700 bg-transparent px-3 py-2 text-red-700 hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-700 dark:hover:text-white"
        >
          Konto löschen
        </button>
      )}
    </section>
  );
}

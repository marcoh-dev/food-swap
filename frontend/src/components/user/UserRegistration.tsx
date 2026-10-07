import { registerAction } from "@/app/actions";
import Link from "next/link";

export function UserRegistration() {
  return (
    <>
       <form className="my-4" action={registerAction}>
        <div className="flex flex-col gap-3">
			<div className="grid gap-0.5">
            <label htmlFor="username">Benutzername</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Wähle deinen Benutzernamen"
              required
                className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
         <div className="grid gap-0.5">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Wähle dein Passwort"
              required
               className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="flex-col gap-3">
          <button type="submit" className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2 mt-5 w-full">Registrieren</button>
        </div>
      </form>
          <div className="font-light text-[10px]">
        Du hast schon ein Konto? Hier geht's zum{" "}
        <Link href="/login">Login</Link>.
      </div>
    </>
  );
}
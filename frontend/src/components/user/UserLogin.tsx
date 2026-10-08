import { loginAction } from "@/app/actions";
import Link from "next/link";

export function UserLogin() {
  return (
    <>
      <form className="my-4" action={loginAction}>
        <div className="flex flex-col gap-3">
			<div className="grid gap-0.5">
            <label htmlFor="username">Benutzername</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Pomodora"
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
              placeholder="********"
              required
               className="border-2 border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button type="submit" className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2 mt-5 w-full">Login</button>
        </div>
      </form>
    <div className="font-light text-[10px]">
        Neu bei FoodSwap? Hier geht's zur{" "}
        <Link href="/registration">Registrierung</Link>.
      </div>
    </>
  );
}


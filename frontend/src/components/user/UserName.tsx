import { nameAction } from "@/app/actions";

export function UserName({username, currentName}: {username: string, currentName?: string}) {
  return (
   
    
         <form className="my-4" action={nameAction}>
        <div className="flex flex-col gap-3">
            <div className="grid gap-0.5">
            <label htmlFor="name">Name</label>
            <p className="text-[10px] leading-snug text-gray-600 dark:text-gray-400">Wähle hier den Namen, unter dem andere User dich sehen können.</p>
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
          <button type="submit" className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2 mt-5 w-full">Speichern</button>
        </div>
         <input type="hidden" name="username" value={username} />
      </form>
     
      );
}


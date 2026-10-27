import * as SheetParts from "@/components/ui/sheet";
import { UserLogout } from "@/components/user/UserLogout";
import { AuthLink } from "@/components/user/AuthLink";
import { ModeToggle } from "@/components/menu/ModeToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/users.service";
import NavLink from "./NavLink";

export default async function BurgerMenu() {
	const currentUser = await getCurrentUser();
	const isLoggedIn = currentUser !== null;

	return (
		<div>
			<SheetParts.Sheet>
				<SheetParts.SheetTrigger asChild>
					<Button type="button" variant="ghost" aria-label="Menü öffnen">
						<Menu className="size-9" />
					</Button>
				</SheetParts.SheetTrigger>

				<SheetParts.SheetContent className="w-full">
					<nav className="flex flex-1 flex-col gap-8 p-4 pt-14">
						<ul className="flex flex-col gap-2">
							<li>
								<SheetParts.SheetClose asChild>
									<NavLink href="/listings">Alle Angebote</NavLink>
								</SheetParts.SheetClose>
							</li>

							<li>
								<SheetParts.SheetClose asChild>
									<NavLink href="/listings/new">Neues Angebot</NavLink>
								</SheetParts.SheetClose>
							</li>
							<li>
								<SheetParts.SheetClose asChild>
									<NavLink href="/chats">Meine Chats</NavLink>
								</SheetParts.SheetClose>
							</li>
						</ul>

						<ul className="flex flex-col gap-2">
							<li>
								<SheetParts.SheetClose asChild>
									<NavLink
										href="/me"
										activeHref={
											currentUser ? `/users/${currentUser.id}` : undefined
										}
									>
										Mein Profil
									</NavLink>
								</SheetParts.SheetClose>
							</li>
							{isLoggedIn ? (
								<li>
									<UserLogout />
								</li>
							) : (
								<>
									<li>
										<SheetParts.SheetClose asChild>
											<AuthLink href="/login">Anmelden</AuthLink>
										</SheetParts.SheetClose>
									</li>
									<li>
										<SheetParts.SheetClose asChild>
											<AuthLink href="/registration">Registrieren</AuthLink>
										</SheetParts.SheetClose>
									</li>
								</>
							)}
						</ul>

						<ul className="flex flex-col gap-2">
							<li>
								<SheetParts.SheetClose asChild>
									<NavLink href="/about">Über uns</NavLink>
								</SheetParts.SheetClose>
							</li>
						</ul>
						<div className="mt-auto border-t pt-4">
							<ModeToggle />
						</div>
					</nav>
				</SheetParts.SheetContent>
			</SheetParts.Sheet>
		</div>
	);
}

import Link from "next/link";
import * as SheetParts from "@/components/ui/sheet";
import { UserLogout } from "@/components/user/UserLogout";
import { AuthLink } from "@/components/user/AuthLink";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/users.service";

export default async function BurgerMenu() {
	const currentUser = await getCurrentUser();
	const isLoggedIn = currentUser !== null;

	return (
		<div>
			<SheetParts.Sheet>
				<SheetParts.SheetTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="size-14"
						aria-label="Menü öffnen"
					>
						<Menu size={30} />
					</Button>
				</SheetParts.SheetTrigger>

				<SheetParts.SheetContent className="w-full">
					<nav className="flex flex-col gap-8 p-4 pt-14">
						<ul className="flex flex-col gap-2">
							<li>
								<SheetParts.SheetClose asChild>
									<Link href="/listings/" className="no-underline">
										Alle Angebote
									</Link>
								</SheetParts.SheetClose>
							</li>

							<li>
								<SheetParts.SheetClose asChild>
									<Link href="/listings/new" className="no-underline">
										Neues Angebot
									</Link>
								</SheetParts.SheetClose>
							</li>
							<li>
								<SheetParts.SheetClose asChild>
									<Link href="/me/listings" className="no-underline">
										Meine Angebote
									</Link>
								</SheetParts.SheetClose>
							</li>
							<li>
								<SheetParts.SheetClose asChild>
									<Link href="/chats" className="no-underline">
										Meine Chats
									</Link>
								</SheetParts.SheetClose>
							</li>
						</ul>

						<ModeToggle />

						<ul className="flex flex-col gap-2">
							<li>
								<SheetParts.SheetClose asChild>
									<Link href="/me" className="no-underline">
										Mein Profil
									</Link>
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
											<AuthLink href="/login" className="no-underline">
												Anmelden
											</AuthLink>
										</SheetParts.SheetClose>
									</li>
									<li>
										<SheetParts.SheetClose asChild>
											<AuthLink href="/registration" className="no-underline">
												Registrieren
											</AuthLink>
										</SheetParts.SheetClose>
									</li>
								</>
							)}
						</ul>
					</nav>
				</SheetParts.SheetContent>
			</SheetParts.Sheet>
		</div>
	);
}

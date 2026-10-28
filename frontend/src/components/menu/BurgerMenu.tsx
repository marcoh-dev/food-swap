import { Menu } from "lucide-react";

import { UnreadChatsBadge } from "@/components/chat/UnreadChatsBadge";
import { ModeToggle } from "@/components/menu/ModeToggle";
import { Button } from "@/components/ui/button";
import * as SheetParts from "@/components/ui/sheet";
import { AuthLink } from "@/components/user/AuthLink";
import { UserLogout } from "@/components/user/UserLogout";
import { getCurrentUser } from "@/lib/users.service";

import NavLink from "./NavLink";

export default async function BurgerMenu() {
	const currentUser = await getCurrentUser();
	const isLoggedIn = currentUser !== null;

	return (
		<div className="flex">
			<SheetParts.Sheet>
				<SheetParts.SheetTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-lg"
						className="relative size-auto p-1"
					>
						<Menu
							className="size-9"
							strokeWidth={2}
							nonScalingStroke
							aria-hidden="true"
						/>
						<span className="sr-only">Menü öffnen</span>
						<UnreadChatsBadge className="absolute -top-1 -right-1" />
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
									<NavLink href="/chats">
										Meine Chats{" "}
										<UnreadChatsBadge className="ml-1 align-middle" />
									</NavLink>
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

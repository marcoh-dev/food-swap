import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import * as SheetParts from "@/components/ui/sheet";
import { Icon } from "@/components/ui/icon";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Food Swap 🍅",
	description: "Lebensmittel Tauschbörse",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={cn(jetbrainsMono.variable, geistSans.variable, geistMono.variable)}
		>
			<body className="text-body font-mono">
				<header className="flex flex-row justify-between items-center p-[1em] h-22.5 bg-red-200 dark:bg-red-800">
					<div className="flex flex-row gap-5">
						<div>
							<Link href="/">
								<Image
									src="/logo.png"
									alt="food swap logo"
									width="50"
									height="50"
								/>
							</Link>
						</div>
						<h1 className="text-h1">
							<Link href="/" className="no-underline">
								FoodSwap
							</Link>
						</h1>
					</div>
					<div>
						<SheetParts.Sheet>
							<SheetParts.SheetTrigger asChild>
								<button type="button" aria-label="Menü öffnen">
									<Icon
										name="menu"
										style={{ color: "var(--v-accent-ink)" }}
										feedbackDuration={0.7}
										feedbackEase="gentle"
										width={50}
										height={50}
									/>
								</button>
							</SheetParts.SheetTrigger>
							<SheetParts.SheetContent className="w-full">
								<SheetParts.SheetHeader>
									<SheetParts.SheetClose
										className="ml-auto"
										aria-label="Menü schließen"
									>
										<Icon
											name="close"
											style={{ color: "var(--v-accent-ink)" }}
											feedbackDuration={0.7}
											feedbackEase="gentle"
											width={50}
											height={50}
										/>
									</SheetParts.SheetClose>
								</SheetParts.SheetHeader>
								<ul>
									<li>
										<SheetParts.SheetClose asChild>
											<Link href="/login">Anmelden</Link>
										</SheetParts.SheetClose>
									</li>
									<li>
										<SheetParts.SheetClose asChild>
											<Link href="/registration">Registrieren</Link>
										</SheetParts.SheetClose>
									</li>
								</ul>
							</SheetParts.SheetContent>
						</SheetParts.Sheet>
					</div>
				</header>
				<main className="p-[1em]">{children}</main>
			</body>
		</html>
	);
}

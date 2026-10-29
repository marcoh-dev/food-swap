import { cn } from "cn";
import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ChatNotifications } from "@/components/chat/ChatNotifications";
import { ChatSocketConnector } from "@/components/chat/ChatSocketConnector";
import { UnreadChatsTitle } from "@/components/chat/UnreadChatsTitle";
import BurgerMenu from "@/components/menu/BurgerMenu";
import Toast from "@/components/shared/Toast";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import { getCurrentUser } from "@/lib/users.service";

import "./globals.css";

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
	title: {
		template: "%s | FoodSwap",
		default: "FoodSwap",
	},
	description: "Tausche oder verschenke Lebensmittel in deiner Nähe.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
	const currentUser = await getCurrentUser();
	const token = currentUser ? ((await cookies()).get(AUTH_COOKIE)?.value ?? null) : null;

	return (
		<html
			lang="en"
			className={cn(
				"scroll-pt-header",
				jetbrainsMono.variable,
				geistSans.variable,
				geistMono.variable,
			)}
			suppressHydrationWarning
		>
			<body className="text-body">
				<ChatSocketConnector token={token} userId={currentUser?.id ?? null} />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<header className="sticky top-0 z-50 h-header border-b bg-background/85 text-foreground backdrop-blur-md">
						<div className="mx-auto flex h-full w-full max-w-7xl flex-row items-center justify-between p-[1em]">
							<div className="flex flex-row items-center gap-5">
								<Link href="/" aria-label="Home" className="block">
									<Image
										src="/icon.svg"
										alt="FoodSwap Logo"
										width="50"
										height="50"
										className="block"
									/>
								</Link>
								<Link href="/" className="text-h1 no-underline">
									FoodSwap
								</Link>
							</div>
							<BurgerMenu />
						</div>
					</header>
					<main className="mx-auto w-full max-w-7xl p-[1em]">{children}</main>
					<Toaster />
					{currentUser && (
						<>
							<ChatNotifications />
							<UnreadChatsTitle />
						</>
					)}
					<Suspense>
						<Toast />
					</Suspense>
				</ThemeProvider>
			</body>
		</html>
	);
}

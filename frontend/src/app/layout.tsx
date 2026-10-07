import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
			className={cn(
				geistSans.variable,
				geistMono.variable,
				"font-mono",
				jetbrainsMono.variable,
			)}
		>
			<body className="text-body">
				<header className="flex flex-row h-22.5">
					<div>
						<Image src="/logo.png" alt="food swap logo" width="50" height="50" />
					</div>
					<h1 className="text-h1">
						<Link href="/">FoodSwap</Link>
					</h1>
				</header>
				{children}
			</body>
		</html>
	);
}

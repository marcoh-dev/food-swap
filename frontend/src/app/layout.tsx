import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "../components/ui/icon";
import * as SheetParts from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
    <html lang="en" className={cn(jetbrainsMono.variable)}>
      <body className="text-body">
        <header className="flex flex-row justify-between items-center p-[1em] h-22.5 bg-red-200 dark:bg-red-950">
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
              <Link href="/">FoodSwap</Link>
            </h1>
          </div>
          <div>
            <SheetParts.Sheet>
              <SheetParts.SheetTrigger>
                <Icon
                  name="menu"
                  style={{ color: "var(--v-accent-ink)" }}
                  feedbackDuration={0.7}
                  feedbackEase="gentle"
                  width={50}
                  height={50}
                />
              </SheetParts.SheetTrigger>
              <SheetParts.SheetContent className="w-full">
                {" "}
                <SheetParts.SheetHeader>
                  <SheetParts.SheetClose className="ml-auto">
                    <Icon
                      name="close"
                      style={{ color: "var(--v-accent-ink)" }}

                      feedbackDuration={0.7}
                      feedbackEase="gentle"
                    />
                  </SheetParts.SheetClose>
                </SheetParts.SheetHeader>
                <ul>
                  <li>
                    <Link href="/login">
                      <SheetParts.SheetClose>Anmelden</SheetParts.SheetClose>
                    </Link>
                  </li>
                  <li>
                    <Link href="/registration">
                      <SheetParts.SheetClose>
                        Registrieren
                      </SheetParts.SheetClose>
                    </Link>
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

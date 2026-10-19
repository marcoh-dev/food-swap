import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import BurgerMenu from "@/components/BurgerMenu";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/fetchAPI";
import { getCurrentUser } from "@/lib/users.service";
import { ChatSocketConnector } from "@/components/chat/ChatSocketConnector";
import { Toaster } from "@/components/ui/sonner";
import Toast from "@/components/Toast";
import { Suspense } from "react";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const currentUser = await getCurrentUser();
  const token = currentUser
    ? ((await cookies()).get(AUTH_COOKIE)?.value ?? null)
    : null;

  return (
    <html
      lang="en"
      className={cn(
        jetbrainsMono.variable,
        geistSans.variable,
        geistMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="text-body font-mono">
        <ChatSocketConnector token={token} userId={currentUser?.id ?? null} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
            <BurgerMenu />
          </header>
          <main className="p-[1em]">{children}</main>
          <Toaster />
          <Suspense>
            <Toast />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

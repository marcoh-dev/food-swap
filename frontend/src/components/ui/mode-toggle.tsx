"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Design hell/dunkel wechseln"
    >
      <Moon className="h-[1.2rem] w-[1.2rem] dark:hidden" />
      <Sun className="hidden h-[1.2rem] w-[1.2rem] dark:block" />
    </Button>
  );
}

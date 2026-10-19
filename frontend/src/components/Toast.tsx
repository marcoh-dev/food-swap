"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const toastMessages: Record<string, string> = {
  registered: "Registrierung erfolgreich! Du kannst dich jetzt anmelden.",
  "listing-created": "Anzeige erfolgreich erstellt!",
  "listing-deleted": "Anzeige gelöscht.",
};

export default function Toast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const toastKey = searchParams.get("toast");

  useEffect(() => {
    if (!toastKey) {
      return;
    }

    const message = toastMessages[toastKey];

    if (!message) {
      return;
    }

    toast.success(message, { id: toastKey });
    router.replace(pathname);
  }, [toastKey, pathname, router]);

  return null;
}

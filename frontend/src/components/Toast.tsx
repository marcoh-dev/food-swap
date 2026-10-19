"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toastMessages } from "@/lib/constants/toast.constants";

export default function Toast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const toastKey = searchParams.get("toast");

  useEffect(() => {
    if (!toastKey) {
      return;
    }

    const entry = toastMessages[toastKey];

    if (!entry) {
      return;
    }

    toast[entry.type](entry.message, { id: toastKey });

    const remainingParams = new URLSearchParams(searchParams.toString());
    remainingParams.delete("toast");
    const query = remainingParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [toastKey, pathname, router, searchParams]);

  return null;
}

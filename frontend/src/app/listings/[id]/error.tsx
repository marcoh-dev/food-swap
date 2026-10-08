"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>{error.message}</p>
      <Button variant={"secondary"} onClick={reset}>
        Nochmal versuchen.
      </Button>
    </div>
  );
}

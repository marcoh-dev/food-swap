import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <p className="flex items-center gap-2">
      Angebote in deiner Nähe werden geladen
      <Spinner />
    </p>
  );
}

import type { ToastType } from "../types/toast.types";

export const toastMessages: Record<
  string,
  { type: ToastType; message: string }
> = {
  registered: {
    type: "success",
    message: "Registrierung erfolgreich! Du kannst dich jetzt anmelden.",
  },
  "listing-created": {
    type: "success",
    message: "Anzeige erfolgreich erstellt!",
  },
  "listing-deleted": {
    type: "info",
    message: "Anzeige gelöscht.",
  },
};

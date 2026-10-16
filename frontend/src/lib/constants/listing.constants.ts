import type { ListingStatus, StatusAction } from "../types/listing.types";

export const statusActions: Partial<Record<ListingStatus, StatusAction[]>> = {
  active: [
    {
      label: "Reserviert",
      targetStatus: "reserved",
    },
    {
      label: "Deaktiv",
      targetStatus: "deactivated",
    },
  ],
  reserved: [
    {
      label: "Aktiv",
      targetStatus: "active",
    },
    {
      label: "Deaktiv",
      targetStatus: "deactivated",
    },
  ],
  deactivated: [
    {
      label: "Aktiv",
      targetStatus: "active",
    },
  ],
};

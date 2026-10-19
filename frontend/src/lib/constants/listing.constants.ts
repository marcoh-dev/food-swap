import type { ListingStatus, StatusAction } from "../types/listing.types";

export const statusActions: Partial<Record<ListingStatus, StatusAction[]>> = {
  active: [
    {
      label: "Reserviert",
      targetStatus: "reserved",
    },
    {
      label: "Deaktiviert",
      targetStatus: "deactivated",
    },
  ],
  reserved: [
    {
      label: "Aktiviert",
      targetStatus: "active",
    },
    {
      label: "Deaktiviert",
      targetStatus: "deactivated",
    },
  ],
  deactivated: [
    {
      label: "Aktiviert",
      targetStatus: "active",
    },
  ],
};

export const statusLabels: Record<ListingStatus, string> = {
  pending: "Ausstehend",
  active: "Aktiviert",
  reserved: "Reserviert",
  deactivated: "Deaktiviert",
};

export const statusOrder: ListingStatus[] = [
  "pending",
  "active",
  "reserved",
  "deactivated",
];

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

export const statusLabels: Record<ListingStatus, string> = {
  pending: "Ausstehend",
  active: "Aktiv",
  reserved: "Reserviert",
  deactivated: "Deaktiv",
};

export const statusOrder: ListingStatus[] = [
  "pending",
  "active",
  "reserved",
  "deactivated",
];

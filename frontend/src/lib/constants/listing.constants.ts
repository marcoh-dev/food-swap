import { ListingStatus, StatusAction } from "../types/listing.types";

export const statusActions: Partial<Record<ListingStatus, StatusAction[]>> = {
  active: [
    {
      label: "Reservieren",
      targetStatus: "reserved",
      className: "bg-amber-200 text-amber-900",
    },
    {
      label: "Deaktivieren",
      targetStatus: "deactivated",
      className: "bg-red-200 text-red-900",
    },
  ],
  reserved: [
    {
      label: "Freigeben",
      targetStatus: "active",
      className: "bg-green-200 text-green-900",
    },
    {
      label: "Deaktivieren",
      targetStatus: "deactivated",
      className: "bg-red-200 text-red-900",
    },
  ],
  deactivated: [
    {
      label: "Reaktivieren",
      targetStatus: "active",
      className: "bg-green-200 text-green-900",
    },
  ],
};

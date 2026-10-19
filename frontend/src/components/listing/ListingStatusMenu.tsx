"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { statusActions } from "@/lib/constants/listing.constants";
import { statusLabels, statusOrder } from "@/lib/types/listing.types";
import type { ListingStatus } from "@/lib/types/listing.types";

type Props = {
  status: ListingStatus;
  onStatusChange: (targetStatus: ListingStatus) => void;
  onDeleteClick: () => void;
};

export default function ListingStatusMenu({
  status,
  onStatusChange,
  onDeleteClick,
}: Props) {
  const allowedTargets = (statusActions[status] ?? []).map(
    (action) => action.targetStatus,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {statusLabels[status]}
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => onStatusChange(value as ListingStatus)}
        >
          {statusOrder.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              disabled={option !== status && !allowedTargets.includes(option)}
            >
              {statusLabels[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={status === "pending"}
          onClick={onDeleteClick}
        >
          <Trash2Icon aria-hidden="true" />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

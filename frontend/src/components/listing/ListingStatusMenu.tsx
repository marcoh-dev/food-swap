"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusActions, statusLabels, statusOrder } from "@/lib/constants/listing.constants";
import type { ListingStatus } from "@/lib/types/listing.types";

type Props = {
	status: ListingStatus;
	onStatusChange: (targetStatus: ListingStatus) => void;
	onDeleteClick: () => void;
};

export default function ListingStatusMenu({ status, onStatusChange, onDeleteClick }: Props) {
	const allowedTargets = (statusActions[status] ?? []).map((action) => action.targetStatus);

	const visibleStatuses =
		status === "pending"
			? statusOrder.filter((option) => option === "pending")
			: statusOrder.filter((option) => option !== "pending");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" disabled={status === "pending"}>
					{statusLabels[status]}
					<ChevronDownIcon aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup
					value={status}
					onValueChange={(value) => onStatusChange(value as ListingStatus)}
				>
					{visibleStatuses.map((option) => (
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
				<DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
					<Trash2Icon aria-hidden="true" />
					Löschen
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

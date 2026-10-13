"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortOption } from "@/lib/types/listing.types";
import { useRouter } from "next/navigation";
import { ArrowDownUp } from "lucide-react";

export function SortingMenu({ sort }: { sort: SortOption }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <div>
        <DropdownMenuTrigger asChild>
          <Button variant="default">
            {sort === "newest" ? "Neueste zuerst" : "Älteste zuerst"}{" "}
            <ArrowDownUp size={16} strokeWidth={1} />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => router.push(`/listings?sort=${value}`)}
          >
            <DropdownMenuRadioItem value="newest">
              Neueste
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">
              Älteste
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

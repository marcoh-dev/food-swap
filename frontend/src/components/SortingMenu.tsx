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
import { useState } from "react";

export function DropdownMenuRadioGroupDemo() {
  const [position, setPosition] = useState("newest");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">Sortierung nach</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
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

"use client";

import { LogOutIcon, MenuIcon } from "lucide-react";

import { LogoutDialog } from "@/components/staff/logout-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StaffMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="h-11 lg:hidden"
          aria-label="Avaa valikko"
        >
          <MenuIcon aria-hidden="true" />
          Valikko
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <LogoutDialog
          trigger={
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="w-full"
            >
              <LogOutIcon aria-hidden="true" className="mr-2 size-4" />
              Kirjaudu ulos
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

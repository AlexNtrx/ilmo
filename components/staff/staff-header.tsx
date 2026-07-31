import Link from "next/link";
import { LogOutIcon, SettingsIcon, UsersIcon } from "lucide-react";

import { LogoutDialog } from "@/components/staff/logout-dialog";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Button } from "@/components/ui/button";
import type { StaffActor } from "@/lib/staff/types";

export function StaffHeader({ actor }: { actor: StaffActor }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/staff"
          className="flex min-h-11 items-center gap-3 rounded-md font-bold tracking-[0.12em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md bg-primary text-sm font-extrabold tracking-[-0.08em] text-primary-foreground"
          >
            IL
          </span>
          ILMO
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {actor.role === "admin" ? (
            <nav aria-label="Ylläpito" className="flex items-center gap-1">
              <Button asChild type="button" variant="ghost" size="lg" className="h-11">
                <Link href="/staff/admin/categories"><SettingsIcon />Luokat</Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="lg" className="h-11">
                <Link href="/staff/admin/users"><UsersIcon />Käyttäjät</Link>
              </Button>
            </nav>
          ) : null}
          <span className="text-sm font-medium">{actor.name}</span>
          <LogoutDialog
            trigger={
              <Button type="button" variant="ghost" size="lg" className="h-11">
                <LogOutIcon aria-hidden="true" />
                Kirjaudu ulos
              </Button>
            }
          />
        </div>

        <StaffMenu name={actor.name} role={actor.role} />
      </div>
    </header>
  );
}

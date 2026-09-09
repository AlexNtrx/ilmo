"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightIcon,
  HistoryIcon,
  InboxIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { LogoutDialog } from "@/components/staff/logout-dialog";
import { useStaffPollingPause } from "@/components/staff/staff-interaction-provider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { StaffActor } from "@/lib/staff/types";
import { cn } from "@/lib/utils";

export function StaffBottomNav({ actor }: { actor: StaffActor }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // Pause background polling while profile dialog is open
  useStaffPollingPause(profileOpen);

  const isHistoryActive = pathname.startsWith("/staff/history");
  const isDashboardActive =
    !isHistoryActive &&
    (pathname === "/staff" || pathname.startsWith("/staff/issues"));

  return (
    <>
      <nav
        aria-label="Mobiilinavigaatio"
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
          {/* Tab 1: Ilmoitukset */}
          <Link
            href="/staff"
            aria-current={isDashboardActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md",
              isDashboardActive
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <InboxIcon className="size-5" />
            <span>Ilmoitukset</span>
          </Link>

          {/* Tab 2: Historia */}
          <Link
            href="/staff/history"
            aria-current={isHistoryActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md",
              isHistoryActive
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <HistoryIcon className="size-5" />
            <span>Historia</span>
          </Link>

          {/* Tab 3: Profiili */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-expanded={profileOpen}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md",
              profileOpen
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <UserIcon className="size-5" />
            <span>Profiili</span>
          </button>
        </div>
      </nav>

      {/* Profile & Admin Hub Dialog */}
      <AlertDialog open={profileOpen} onOpenChange={setProfileOpen}>
        <AlertDialogContent
          className="max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md gap-0 overflow-y-auto p-0"
          onOverlayClick={() => setProfileOpen(false)}
        >
          <div className="space-y-6 p-6">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center gap-3 text-center">
              <span
                aria-hidden="true"
                className="grid size-16 place-items-center rounded-2xl border border-primary/25 bg-secondary text-primary"
              >
                <UserIcon className="size-8" />
              </span>
              <div>
                <AlertDialogTitle className="text-xl font-bold">
                  {actor.name}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                      actor.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {actor.role === "admin" ? "Ylläpitäjä" : "Henkilökunta"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-block size-2 rounded-full bg-emerald-500" />
                    Kirjautuneena
                  </span>
                </AlertDialogDescription>
              </div>
            </div>

            {/* Admin Management Links */}
            {actor.role === "admin" ? (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ylläpito
                </p>
                <div className="grid gap-2">
                  <Link
                    href="/staff/admin/categories"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 font-medium transition-colors hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <SettingsIcon className="size-4 text-primary" />
                      Hallitse luokkia
                    </span>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/staff/admin/users"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 font-medium transition-colors hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <UsersIcon className="size-4 text-primary" />
                      Hallitse käyttäjiä
                    </span>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="space-y-2 border-t pt-4">
              <LogoutDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-12 w-full justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOutIcon className="size-4" />
                    Kirjaudu ulos
                  </Button>
                }
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setProfileOpen(false)}
                className="min-h-11 w-full text-muted-foreground"
              >
                Sulje
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

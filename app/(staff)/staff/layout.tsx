import type { ReactNode } from "react";

import { StaffBottomNav } from "@/components/staff/staff-bottom-nav";
import { StaffHeader } from "@/components/staff/staff-header";
import { StaffInteractionProvider } from "@/components/staff/staff-interaction-provider";
import { StaffShell } from "@/components/staff/staff-shell";
import { requireStaffPageActor } from "@/lib/staff/auth";

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await requireStaffPageActor();

  return (
    <StaffInteractionProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <StaffHeader actor={actor} />
        <StaffShell>{children}</StaffShell>
        <StaffBottomNav actor={actor} />
      </div>
    </StaffInteractionProvider>
  );
}

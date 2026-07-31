import type { ReactNode } from "react";

import { StaffHeader } from "@/components/staff/staff-header";
import { StaffInteractionProvider } from "@/components/staff/staff-interaction-provider";
import { requireStaffPageActor } from "@/lib/staff/auth";

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await requireStaffPageActor();

  return (
    <StaffInteractionProvider>
      <div className="min-h-svh">
        <StaffHeader actor={actor} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {children}
        </main>
      </div>
    </StaffInteractionProvider>
  );
}

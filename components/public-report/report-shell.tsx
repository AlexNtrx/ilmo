import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ReportShellProps = {
  children: ReactNode;
  className?: string;
};

export function ReportShell({ children, className }: ReportShellProps) {
  return (
    <main className="flex min-h-svh w-full justify-center px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className={cn("w-full max-w-[36rem]", className)}>
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md bg-primary text-sm font-extrabold tracking-[-0.08em] text-primary-foreground"
          >
            IL
          </span>
          <span className="text-base font-bold tracking-[0.12em]">ILMO</span>
        </div>
        {children}
      </div>
    </main>
  );
}

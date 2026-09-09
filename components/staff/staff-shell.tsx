"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * App shell content container that handles dedicated scrolling.
 * Keeps Header and Bottom Tab Bar stationary while resetting scroll on route change.
 */
export function StaffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 pb-10 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </div>
    </main>
  );
}

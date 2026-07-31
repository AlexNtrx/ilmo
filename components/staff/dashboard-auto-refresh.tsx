"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useStaffPollingPaused } from "@/components/staff/staff-interaction-provider";
import { createDashboardRefreshController } from "@/lib/staff/dashboard-refresh";

type DashboardRefreshController = ReturnType<
  typeof createDashboardRefreshController
>;

export function DashboardAutoRefresh({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const router = useRouter();
  const controller = useRef<DashboardRefreshController | null>(null);
  const sawPendingRefresh = useRef(false);
  const pollingPaused = useStaffPollingPaused();
  const [refreshPending, startTransition] = useTransition();

  useEffect(() => {
    const refreshController = createDashboardRefreshController({
      refresh: () => {
        startTransition(() => {
          router.refresh();
        });
      },
      isVisible: () => document.visibilityState === "visible",
      startInterval: (callback, delay) => window.setInterval(callback, delay),
      stopInterval: (timer) => window.clearInterval(timer),
      subscribeVisibility: (callback) => {
        document.addEventListener("visibilitychange", callback);
        return () => {
          document.removeEventListener("visibilitychange", callback);
        };
      },
    });

    controller.current = refreshController;
    const cleanup = refreshController.start();

    return () => {
      controller.current = null;
      cleanup();
    };
  }, [router, startTransition]);

  useEffect(() => {
    controller.current?.markRefreshComplete();
  }, [refreshToken]);

  useEffect(() => {
    if (refreshPending) {
      sawPendingRefresh.current = true;
      return;
    }

    if (sawPendingRefresh.current) {
      sawPendingRefresh.current = false;
      controller.current?.markRefreshComplete();
    }
  }, [refreshPending]);

  useEffect(() => {
    controller.current?.setPaused(pollingPaused);
  }, [pollingPaused]);

  return null;
}

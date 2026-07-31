"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StaffInteractionContextValue = {
  pollingPaused: boolean;
  pausePolling: () => () => void;
};

const StaffInteractionContext =
  createContext<StaffInteractionContextValue | null>(null);

export function StaffInteractionProvider({ children }: { children: ReactNode }) {
  const [pauseCount, setPauseCount] = useState(0);

  const pausePolling = useCallback(() => {
    let released = false;
    setPauseCount((count) => count + 1);

    return () => {
      if (released) {
        return;
      }

      released = true;
      setPauseCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const value = useMemo(
    () => ({ pollingPaused: pauseCount > 0, pausePolling }),
    [pauseCount, pausePolling],
  );

  return (
    <StaffInteractionContext.Provider value={value}>
      {children}
    </StaffInteractionContext.Provider>
  );
}

export function useStaffPollingPaused() {
  return useContext(StaffInteractionContext)?.pollingPaused ?? false;
}

export function useStaffPollingPause(active: boolean) {
  const pausePolling = useContext(StaffInteractionContext)?.pausePolling;

  useEffect(() => {
    if (!active || !pausePolling) {
      return;
    }

    return pausePolling();
  }, [active, pausePolling]);
}

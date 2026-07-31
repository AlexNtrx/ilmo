export const DASHBOARD_REFRESH_INTERVAL_MS = 20_000;

export function createDashboardRefreshController<TTimer>({
  refresh,
  isVisible,
  startInterval,
  stopInterval,
  subscribeVisibility,
}: {
  refresh: () => void;
  isVisible: () => boolean;
  startInterval: (
    callback: () => void,
    delay: number,
  ) => TTimer;
  stopInterval: (timer: TTimer) => void;
  subscribeVisibility: (callback: () => void) => () => void;
}) {
  let timer: TTimer | null = null;
  let refreshInFlight = false;
  let paused = false;
  let refreshWhenResumed = false;

  const stopTimer = () => {
    if (timer === null) {
      return;
    }

    stopInterval(timer);
    timer = null;
  };

  const requestRefresh = () => {
    if (paused || !isVisible() || refreshInFlight) {
      return;
    }

    refreshInFlight = true;
    try {
      refresh();
    } catch {
      refreshInFlight = false;
    }
  };

  const startTimer = () => {
    stopTimer();
    if (!paused && isVisible()) {
      timer = startInterval(
        requestRefresh,
        DASHBOARD_REFRESH_INTERVAL_MS,
      );
    }
  };

  const handleVisibilityChange = () => {
    stopTimer();

    if (isVisible()) {
      if (paused) {
        refreshWhenResumed = true;
      } else {
        requestRefresh();
        startTimer();
      }
    }
  };

  return {
    start() {
      startTimer();
      const unsubscribe = subscribeVisibility(handleVisibilityChange);

      return () => {
        stopTimer();
        unsubscribe();
      };
    },
    markRefreshComplete() {
      refreshInFlight = false;
    },
    setPaused(nextPaused: boolean) {
      if (paused === nextPaused) {
        return;
      }

      paused = nextPaused;
      stopTimer();

      if (!paused && isVisible()) {
        if (refreshWhenResumed) {
          refreshWhenResumed = false;
          requestRefresh();
        }
        startTimer();
      }
    },
  };
}

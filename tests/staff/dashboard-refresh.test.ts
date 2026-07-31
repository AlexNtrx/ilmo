import assert from "node:assert/strict";
import test from "node:test";

import {
  createDashboardRefreshController,
  DASHBOARD_REFRESH_INTERVAL_MS,
} from "@/lib/staff/dashboard-refresh";

function createHarness(initiallyVisible = true) {
  let visible = initiallyVisible;
  let refreshCount = 0;
  let intervalCallback: (() => void) | null = null;
  let intervalDelay: number | null = null;
  let intervalStarts = 0;
  let intervalStops = 0;
  let visibilityListener: (() => void) | null = null;
  let unsubscribed = false;

  const controller = createDashboardRefreshController({
    refresh: () => {
      refreshCount += 1;
    },
    isVisible: () => visible,
    startInterval: (callback, delay) => {
      intervalCallback = callback;
      intervalDelay = delay;
      intervalStarts += 1;
      return intervalStarts;
    },
    stopInterval: () => {
      intervalStops += 1;
      intervalCallback = null;
    },
    subscribeVisibility: (callback) => {
      visibilityListener = callback;
      return () => {
        unsubscribed = true;
        visibilityListener = null;
      };
    },
  });

  return {
    controller,
    getState: () => ({
      refreshCount,
      intervalDelay,
      intervalStarts,
      intervalStops,
      unsubscribed,
    }),
    tick: () => intervalCallback?.(),
    setVisible(nextVisible: boolean) {
      visible = nextVisible;
      visibilityListener?.();
    },
    setPaused: (paused: boolean) => controller.setPaused(paused),
  };
}

test("refreshes every 20 seconds without overlapping", () => {
  const harness = createHarness();
  const cleanup = harness.controller.start();

  assert.equal(harness.getState().intervalDelay, DASHBOARD_REFRESH_INTERVAL_MS);
  assert.equal(harness.getState().refreshCount, 0);

  harness.tick();
  harness.tick();
  assert.equal(harness.getState().refreshCount, 1);

  harness.controller.markRefreshComplete();
  harness.tick();
  assert.equal(harness.getState().refreshCount, 2);

  cleanup();
  assert.equal(harness.getState().intervalStops, 1);
  assert.equal(harness.getState().unsubscribed, true);
});

test("pauses for staff interaction and resumes without overlap", () => {
  const harness = createHarness();
  const cleanup = harness.controller.start();

  harness.setPaused(true);
  assert.equal(harness.getState().intervalStops, 1);

  harness.setVisible(false);
  harness.setVisible(true);
  assert.equal(harness.getState().refreshCount, 0);

  harness.setPaused(false);
  assert.equal(harness.getState().refreshCount, 1);
  assert.equal(harness.getState().intervalStarts, 2);

  harness.tick();
  assert.equal(harness.getState().refreshCount, 1);
  harness.controller.markRefreshComplete();
  harness.tick();
  assert.equal(harness.getState().refreshCount, 2);

  cleanup();
});

test("allows the next interval after a temporary refresh failure", () => {
  let shouldFail = true;
  let attempts = 0;
  let intervalCallback: (() => void) | null = null;

  const controller = createDashboardRefreshController({
    refresh: () => {
      attempts += 1;
      if (shouldFail) {
        shouldFail = false;
        throw new Error("temporary failure");
      }
    },
    isVisible: () => true,
    startInterval: (callback) => {
      intervalCallback = callback;
      return 1;
    },
    stopInterval: () => {
      intervalCallback = null;
    },
    subscribeVisibility: () => () => undefined,
  });

  const cleanup = controller.start();
  assert.doesNotThrow(() => intervalCallback?.());
  assert.doesNotThrow(() => intervalCallback?.());
  assert.equal(attempts, 2);
  cleanup();
});

test("pauses while hidden and refreshes immediately when visible", () => {
  const harness = createHarness(false);
  const cleanup = harness.controller.start();

  assert.equal(harness.getState().intervalStarts, 0);
  harness.tick();
  assert.equal(harness.getState().refreshCount, 0);

  harness.setVisible(true);
  assert.equal(harness.getState().refreshCount, 1);
  assert.equal(harness.getState().intervalStarts, 1);

  harness.controller.markRefreshComplete();
  harness.setVisible(false);
  assert.equal(harness.getState().intervalStops, 1);

  cleanup();
  assert.equal(harness.getState().unsubscribed, true);
});

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isDebugFlickerEnabledEnv, isDebugFlickerEnabledRuntime } from "@/lib/perf/ui-perf-flags";

type ReactCommitRecord = {
  t: number;
  profilerId: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
};

type HandlerRecord = {
  type: string;
  count: number;
  samples: Array<{ stack: string; count: number }>;
};

type MutationTargetSummary = { selector: string; count: number };

type FlickerWindowSnapshot = {
  label: string;
  startedAt: number;
  endedAt: number;
  react: { commits: number; byProfilerId: Record<string, number> };
  cls: { total: number; entries: number };
  mutations: { attributeMutations: number; topTargets: MutationTargetSummary[] };
  frames: { count: number; maxDeltaMs: number; over16ms: number; over33ms: number };
};

type FlickerDebugApi = {
  version: 1;
  enabled: boolean;
  startWindow: (label: string) => void;
  endWindow: () => FlickerWindowSnapshot | null;
  getListenerInventory: () => Record<string, HandlerRecord>;
  getCompositingReport: () => unknown;
  recordReactCommit: (record: ReactCommitRecord) => void;
};

declare global {
  interface Window {
    __flickerDebug?: FlickerDebugApi;
    __flickerDebugInternal?: {
      enabled: boolean;
      windowLabel: string | null;
      windowStartedAt: number;
      windowReactCommits: ReactCommitRecord[];
      windowClsTotal: number;
      windowClsEntries: number;
      windowAttributeMutations: number;
      windowMutationTargetCounts: Map<string, number>;
      windowFrameTimes: number[];
      listenerInventory: Record<string, HandlerRecord>;
      compositingReport: unknown;
    };
  }
}

const INTERESTING_LISTENER_TYPES = new Set(["scroll", "wheel", "mousemove", "pointermove", "resize"]);

function selectorForNode(node: Element): string {
  const id = node.getAttribute("id");
  if (id) return `#${id}`;
  const testId = node.getAttribute("data-testid");
  if (testId) return `[data-testid="${testId}"]`;
  const role = node.getAttribute("role");
  const rolePart = role ? `[role="${role}"]` : "";
  const className = node.getAttribute("class")?.trim().split(/\s+/).slice(0, 3).join(".") ?? "";
  const classPart = className ? `.${className}` : "";
  return `${node.tagName.toLowerCase()}${rolePart}${classPart}`;
}

function recordListenerRegistration(type: string, stack: string | null) {
  const inv = window.__flickerDebugInternal?.listenerInventory;
  if (!inv) return;
  const existing =
    inv[type] ??
    (inv[type] = {
      type,
      count: 0,
      samples: [],
    });

  existing.count += 1;
  if (!stack) return;

  if (existing.samples.length < 10) {
    existing.samples.push({ stack, count: 1 });
    return;
  }

  for (const sample of existing.samples) {
    if (sample.stack === stack) {
      sample.count += 1;
      return;
    }
  }
}

function patchAddEventListenerOnce() {
  const w = window as any;
  if (w.__flickerDebug_addEventListenerPatched) return;
  w.__flickerDebug_addEventListenerPatched = true;

  const originalAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function addEventListenerPatched(
    type: string,
    listener: any,
    options?: any
  ) {
    try {
      if (window.__flickerDebugInternal?.enabled && INTERESTING_LISTENER_TYPES.has(type)) {
        const stack = Math.random() < 0.05 ? new Error().stack ?? "" : null;
        recordListenerRegistration(type, stack);
      }
    } catch {
      // best-effort only
    }
    return originalAdd.call(this, type, listener, options);
  };
}

function computeStackingContextReason(style: CSSStyleDeclaration): string[] {
  const reasons: string[] = [];
  if (style.transform && style.transform !== "none") reasons.push("transform");
  if (style.filter && style.filter !== "none") reasons.push("filter");
  if ((style as any).backdropFilter && (style as any).backdropFilter !== "none") reasons.push("backdrop-filter");
  if (style.opacity && Number(style.opacity) < 1) reasons.push("opacity");
  if (style.position !== "static" && style.zIndex !== "auto") reasons.push("position+z-index");
  if (style.isolation === "isolate") reasons.push("isolation:isolate");
  if (style.willChange && style.willChange !== "auto") reasons.push(`will-change:${style.willChange}`);
  if (style.contain && style.contain !== "none") reasons.push(`contain:${style.contain}`);
  return reasons;
}

function collectCompositingReport() {
  const selectors = [
    '[data-testid="mobile-header"]',
    '[data-testid="sidebar"]',
    '[data-testid="transactions-page-header"]',
    '[data-testid="transactions-list"]',
    '[data-testid="transactions-virtualized-scroll"]',
    '[data-testid="transactions-sticky-date-header"]',
  ];

  function findTransformedAncestor(el: Element): Element | null {
    let current: Element | null = el.parentElement;
    while (current) {
      const s = window.getComputedStyle(current);
      if (s.transform && s.transform !== "none") return current;
      current = current.parentElement;
    }
    return null;
  }

  const report: Record<string, any> = {};
  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) continue;
    const style = window.getComputedStyle(el);
    const transformedAncestor = findTransformedAncestor(el);
    report[selector] = {
      position: style.position,
      top: style.top,
      zIndex: style.zIndex,
      transform: style.transform,
      filter: style.filter,
      backdropFilter: (style as any).backdropFilter ?? "n/a",
      willChange: style.willChange,
      contain: style.contain,
      opacity: style.opacity,
      stackingContextReasons: computeStackingContextReason(style),
      transformedAncestor: transformedAncestor ? selectorForNode(transformedAncestor) : null,
      stickyInsideTransformedAncestor: style.position === "sticky" && Boolean(transformedAncestor),
    };
  }
  window.__flickerDebugInternal!.compositingReport = report;
}

export function FlickerInstrumentation() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const lastRateRef = useRef<{ t: number; commits: number; mutations: number }>({
    t: 0,
    commits: 0,
    mutations: 0,
  });

  const layoutShiftObserverRef = useRef<PerformanceObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const on = isDebugFlickerEnabledEnv() || isDebugFlickerEnabledRuntime();
    setEnabled(on);
    enabledRef.current = on;
  }, []);

  const api: FlickerDebugApi = useMemo(() => {
    return {
      version: 1,
      enabled,
      startWindow: (label: string) => {
        const internal = window.__flickerDebugInternal;
        if (!internal) return;
        internal.windowLabel = label;
        internal.windowStartedAt = performance.now();
        internal.windowReactCommits = [];
        internal.windowClsTotal = 0;
        internal.windowClsEntries = 0;
        internal.windowAttributeMutations = 0;
        internal.windowMutationTargetCounts = new Map();
        internal.windowFrameTimes = [];
      },
      endWindow: () => {
        const internal = window.__flickerDebugInternal;
        if (!internal || !internal.windowLabel) return null;
        const endedAt = performance.now();

        const byProfilerId: Record<string, number> = {};
        for (const c of internal.windowReactCommits) {
          byProfilerId[c.profilerId] = (byProfilerId[c.profilerId] ?? 0) + 1;
        }

        const targets: MutationTargetSummary[] = Array.from(internal.windowMutationTargetCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([selector, count]) => ({ selector, count }));

        let over16ms = 0;
        let over33ms = 0;
        let maxDeltaMs = 0;
        const frames = internal.windowFrameTimes;
        for (let i = 1; i < frames.length; i++) {
          const delta = frames[i] - frames[i - 1];
          if (delta > 16) over16ms += 1;
          if (delta > 33) over33ms += 1;
          if (delta > maxDeltaMs) maxDeltaMs = delta;
        }

        const snapshot: FlickerWindowSnapshot = {
          label: internal.windowLabel,
          startedAt: internal.windowStartedAt,
          endedAt,
          react: {
            commits: internal.windowReactCommits.length,
            byProfilerId,
          },
          cls: {
            total: internal.windowClsTotal,
            entries: internal.windowClsEntries,
          },
          mutations: {
            attributeMutations: internal.windowAttributeMutations,
            topTargets: targets,
          },
          frames: {
            count: frames.length,
            maxDeltaMs,
            over16ms,
            over33ms,
          },
        };

        internal.windowLabel = null;
        return snapshot;
      },
      getListenerInventory: () => window.__flickerDebugInternal?.listenerInventory ?? {},
      getCompositingReport: () => window.__flickerDebugInternal?.compositingReport ?? null,
      recordReactCommit: (record: ReactCommitRecord) => {
        const internal = window.__flickerDebugInternal;
        if (!internal || !internal.windowLabel) return;
        internal.windowReactCommits.push(record);
      },
    };
  }, [enabled]);

  useEffect(() => {
    window.__flickerDebugInternal = window.__flickerDebugInternal ?? {
      enabled: false,
      windowLabel: null,
      windowStartedAt: 0,
      windowReactCommits: [],
      windowClsTotal: 0,
      windowClsEntries: 0,
      windowAttributeMutations: 0,
      windowMutationTargetCounts: new Map(),
      windowFrameTimes: [],
      listenerInventory: {},
      compositingReport: null,
    };
    window.__flickerDebugInternal.enabled = enabled;
    window.__flickerDebug = api;
  }, [enabled, api]);

  useEffect(() => {
    if (!enabled) return;

    patchAddEventListenerOnce();

    collectCompositingReport();

    try {
      layoutShiftObserverRef.current?.disconnect();
      layoutShiftObserverRef.current = new PerformanceObserver((list) => {
        const internal = window.__flickerDebugInternal;
        if (!internal?.windowLabel) return;
        for (const entry of list.getEntries() as any[]) {
          if (entry.hadRecentInput) continue;
          internal.windowClsTotal += entry.value ?? 0;
          internal.windowClsEntries += 1;
        }
      });
      layoutShiftObserverRef.current.observe({ type: "layout-shift", buffered: true } as any);
    } catch {
      // Some browsers / modes may not support it
    }

    mutationObserverRef.current?.disconnect();
    mutationObserverRef.current = new MutationObserver((mutations) => {
      const internal = window.__flickerDebugInternal;
      if (!internal?.windowLabel) return;

      for (const m of mutations) {
        if (m.type !== "attributes") continue;
        if (m.attributeName !== "class" && m.attributeName !== "style") continue;
        internal.windowAttributeMutations += 1;
        if (m.target && (m.target as any).nodeType === 1) {
          const sel = selectorForNode(m.target as Element);
          internal.windowMutationTargetCounts.set(sel, (internal.windowMutationTargetCounts.get(sel) ?? 0) + 1);
        }
      }
    });
    mutationObserverRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: true,
    });

    const perSecondTicker = window.setInterval(() => {
      const internal = window.__flickerDebugInternal;
      if (!internal?.windowLabel) return;

      const now = performance.now();
      const last = lastRateRef.current;
      if (!last.t) {
        lastRateRef.current = {
          t: now,
          commits: internal.windowReactCommits.length,
          mutations: internal.windowAttributeMutations,
        };
        return;
      }

      const commitsLastSecond = internal.windowReactCommits.length - last.commits;
      const mutationsLastSecond = internal.windowAttributeMutations - last.mutations;
      const clsTotal = internal.windowClsTotal;

      lastRateRef.current = {
        t: now,
        commits: internal.windowReactCommits.length,
        mutations: internal.windowAttributeMutations,
      };

      console.log("[DEBUG_FLICKER] 1s window", {
        label: internal.windowLabel,
        commitsPerSecond: commitsLastSecond,
        clsTotal,
        mutationsPerSecond: mutationsLastSecond,
      });

      if (mutationsLastSecond > 200) {
        const top = Array.from(internal.windowMutationTargetCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([selector, count]) => ({ selector, count }));
        console.warn("[DEBUG_FLICKER] High attribute mutation rate", {
          mutationsLastSecond,
          label: internal.windowLabel,
          topTargets: top,
        });
      }
    }, 1000);

    console.log("[DEBUG_FLICKER] Listener inventory", window.__flickerDebugInternal?.listenerInventory ?? {});
    console.log("[DEBUG_FLICKER] Compositing report", window.__flickerDebugInternal?.compositingReport ?? null);

    return () => {
      layoutShiftObserverRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
      window.clearInterval(perSecondTicker);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    const tick = (t: number) => {
      const internal = window.__flickerDebugInternal;
      if (internal?.windowLabel) {
        internal.windowFrameTimes.push(t);
        if (internal.windowFrameTimes.length > 5000) {
          internal.windowFrameTimes.splice(0, internal.windowFrameTimes.length - 5000);
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [enabled]);

  return null;
}

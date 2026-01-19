"use client";

import { Profiler, type ReactNode, useCallback, useEffect, useState } from "react";
import { isDebugFlickerEnabledEnv, isDebugFlickerEnabledRuntime } from "@/lib/perf/ui-perf-flags";

export function FlickerProfiler({ id, children }: { id: string; children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isDebugFlickerEnabledEnv() || isDebugFlickerEnabledRuntime());
  }, []);

  const onRender = useCallback(
    (
      profilerId: string,
      phase: "mount" | "update" | "nested-update",
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      if (!enabled) return;
      window.__flickerDebug?.recordReactCommit({
        t: performance.now(),
        profilerId,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
      });
    },
    [enabled]
  );

  if (!enabled) return <>{children}</>;
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

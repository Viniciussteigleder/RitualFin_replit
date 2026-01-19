"use client";

import { useEffect } from "react";
import { isUiPerfFixesEnabledEnv, uiPerfFixesRuntimeOverride } from "@/lib/perf/ui-perf-flags";

function applyFlag(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) root.dataset.uiPerfFixes = "1";
  else delete root.dataset.uiPerfFixes;
}

export function UiPerfFixesRoot() {
  useEffect(() => {
    const override = uiPerfFixesRuntimeOverride();
    if (override === "1") applyFlag(true);
    else if (override === "0") applyFlag(false);
    else applyFlag(isUiPerfFixesEnabledEnv());
  }, []);

  return null;
}


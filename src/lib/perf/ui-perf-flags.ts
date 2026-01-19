export function isUiPerfFixesEnabledRuntime(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("UI_PERF_FIXES") === "1";
}

export function uiPerfFixesRuntimeOverride(): "0" | "1" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem("UI_PERF_FIXES");
  if (v === "0" || v === "1") return v;
  return null;
}

export function isDebugFlickerEnabledRuntime(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("DEBUG_FLICKER") === "1";
}

export function isUiPerfFixesEnabledEnv(): boolean {
  return process.env.NEXT_PUBLIC_UI_PERF_FIXES !== "0";
}

export function isDebugFlickerEnabledEnv(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_FLICKER === "1";
}

export function isUiPerfFixesEnabled(): boolean {
  const override = uiPerfFixesRuntimeOverride();
  if (override === "0") return false;
  if (override === "1") return true;
  return isUiPerfFixesEnabledEnv();
}

export function isDebugFlickerEnabled(): boolean {
  return isDebugFlickerEnabledEnv() || isDebugFlickerEnabledRuntime();
}

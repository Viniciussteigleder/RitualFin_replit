# Flicker Metrics (Production Build)

Captured via Playwright + `localStorage.DEBUG_FLICKER="1"` on `/transactions` using deterministic mock transactions (`localStorage.DEBUG_FLICKER_MOCK_DATA="1"`).

## Before (UI_PERF_FIXES=0)

- Window: `baseline-scroll-hover`
- React commits: `0`
- CLS: `0` (`0` entries)
- Frames: `maxDeltaMs=133.8`, `over33ms=61`, `count=104`

## After (UI_PERF_FIXES=1)

- Window: `baseline-scroll-hover`
- React commits: `0`
- CLS: `0` (`0` entries)
- Frames: `maxDeltaMs=33.3`, `over33ms=2`, `count=77`


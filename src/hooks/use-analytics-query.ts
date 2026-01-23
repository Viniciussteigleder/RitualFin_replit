"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";

// Validation Schema for URL Params
export const analyticsParamsSchema = z.object({
  view: z.enum(["overview", "trends", "breakdown", "merchants", "recurring"]).default("overview"),
  scope: z.string().optional(), // key:value,key:value
  start: z.string().optional(), // YYYY-MM-DD
  end: z.string().optional(),   // YYYY-MM-DD
  accounts: z.string().optional(), // id,id,id
  type: z.enum(["all", "expense", "income"]).default("all"),
  mode: z.enum(["table", "chart"]).optional(),
  // Drill-down params
  appCategory: z.string().optional(),
  category1: z.string().optional(),
  category2: z.string().optional(),
  category3: z.string().optional(),
  recurring: z.union([z.boolean(), z.string()]).optional(),
  fixVar: z.enum(["Fixo", "Variável"]).optional(),
});

export type AnalyticsParams = z.infer<typeof analyticsParamsSchema>;

export function useAnalyticsQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Parse current params (safe parse with defaults)
  const currentParams = useMemo(() => {
    const raw: Record<string, string> = {};
    searchParams.forEach((val, key) => { raw[key] = val; });
    
    // Set default dates if missing
    if (!raw.start || !raw.end) {
      const now = new Date();
      if (!raw.start) raw.start = format(startOfMonth(now), "yyyy-MM-dd");
      if (!raw.end) raw.end = format(endOfMonth(now), "yyyy-MM-dd");
    }

    const result = analyticsParamsSchema.safeParse(raw);
    return result.success ? result.data : analyticsParamsSchema.parse({});
  }, [searchParams]);

  // 2. Helper to get parsed dates
  const dateRange = useMemo(() => ({
    from: currentParams.start ? parseISO(currentParams.start) : undefined,
    to: currentParams.end ? parseISO(currentParams.end) : undefined,
  }), [currentParams.start, currentParams.end]);

  // 3. Update function
  const updateParams = useCallback((newParams: Partial<AnalyticsParams>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // 4. Reset function
  const resetParams = useCallback(() => {
    const now = new Date();
    const defaults = {
        view: "overview",
        start: format(startOfMonth(now), "yyyy-MM-dd"),
        end: format(endOfMonth(now), "yyyy-MM-dd"),
        type: "all",
    };
    /* Remove all other keys */
    const params = new URLSearchParams();
    params.set("view", defaults.view);
    params.set("start", defaults.start);
    params.set("end", defaults.end);
    params.set("type", defaults.type);
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router]);

  return {
    params: currentParams,
    dateRange,
    updateParams,
    resetParams,
  };
}

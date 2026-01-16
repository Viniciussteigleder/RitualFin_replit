import type { RuleMatch } from "@/lib/rules/engine";
import { taxonomyPathKey, type LeafHierarchy } from "@/lib/taxonomy/hierarchy";

export type EnrichedCandidate = {
  leafId: string;
  ruleId: string;
  matchedKeyword: string | null;
  priority: number;
  strict: boolean;
  isSystem: boolean;
  appCategoryName: string | null;
  category1: string;
  category2: string;
  category3: string;
};

export type LeafResolutionStatus = "MATCHED" | "OPEN" | "CONFLICT";

export type LeafResolution = {
  status: LeafResolutionStatus;
  leafId: string;
  needsReview: boolean;
  confidence: number;
  ruleIdApplied: string | null;
  matchedKeyword: string | null;
  candidates: EnrichedCandidate[];
};

function fallbackOpenHierarchy(openLeafId: string): LeafHierarchy {
  return {
    leafId: openLeafId,
    appCategoryId: null,
    appCategoryName: "OPEN",
    category1: "OPEN",
    category2: "OPEN",
    category3: "OPEN",
    typeDefault: null,
    fixVarDefault: null,
  };
}

export function resolveLeafFromMatches(args: {
  matches: RuleMatch[] | undefined;
  openLeafId: string;
  taxonomyByLeafId: Map<string, LeafHierarchy>;
  taxonomyByPathKey: Map<string, string>;
  confidence?: number | null;
  needsReview?: boolean | null;
  ruleIdApplied?: string | null;
  matchedKeyword?: string | null;
}): LeafResolution {
  const {
    matches,
    openLeafId,
    taxonomyByLeafId,
    taxonomyByPathKey,
    confidence,
    needsReview,
    ruleIdApplied,
  } = args;

  const openHierarchy = taxonomyByLeafId.get(openLeafId) ?? fallbackOpenHierarchy(openLeafId);

  if (!matches || matches.length === 0) {
    return {
      status: "OPEN",
      leafId: openLeafId,
      needsReview: true,
      confidence: 0,
      ruleIdApplied: null,
      matchedKeyword: null,
      candidates: [],
    };
  }

  const enriched: EnrichedCandidate[] = [];

  for (const m of matches) {
    const directLeafId = m.leafId && m.leafId !== "open" ? m.leafId : null;
    const mappedLeafId =
      directLeafId ??
      taxonomyByPathKey.get(
        taxonomyPathKey({ category1: m.category1, category2: m.category2, category3: m.category3 })
      ) ??
      null;

    if (!mappedLeafId) continue;
    const hierarchy = taxonomyByLeafId.get(mappedLeafId) ?? openHierarchy;

    enriched.push({
      leafId: mappedLeafId,
      ruleId: m.ruleId,
      matchedKeyword: m.matchedKeyword ?? null,
      priority: m.priority,
      strict: m.strict,
      isSystem: m.isSystem,
      appCategoryName: hierarchy.appCategoryName,
      category1: hierarchy.category1,
      category2: hierarchy.category2,
      category3: hierarchy.category3,
    });
  }

  const uniqueLeafIds = new Set(enriched.map((c) => c.leafId));

  if (uniqueLeafIds.size === 0) {
    return {
      status: "OPEN",
      leafId: openLeafId,
      needsReview: true,
      confidence: 0,
      ruleIdApplied: null,
      matchedKeyword: null,
      candidates: [],
    };
  }

  if (uniqueLeafIds.size > 1) {
    const bestPerLeaf = new Map<string, EnrichedCandidate>();
    for (const c of enriched) {
      const existing = bestPerLeaf.get(c.leafId);
      if (!existing) {
        bestPerLeaf.set(c.leafId, c);
        continue;
      }
      if (c.strict && !existing.strict) {
        bestPerLeaf.set(c.leafId, c);
        continue;
      }
      if (c.priority > existing.priority) {
        bestPerLeaf.set(c.leafId, c);
      }
    }

    return {
      status: "CONFLICT",
      leafId: openLeafId,
      needsReview: true,
      confidence: 0,
      ruleIdApplied: null,
      matchedKeyword: null,
      candidates: Array.from(bestPerLeaf.values()).sort((a, b) => b.priority - a.priority),
    };
  }

  const [resolvedLeafId] = Array.from(uniqueLeafIds.values());
  const candidatesForLeaf = enriched.filter((c) => c.leafId === resolvedLeafId);
  const applied =
    (ruleIdApplied ? candidatesForLeaf.find((c) => c.ruleId === ruleIdApplied) : undefined) ??
    candidatesForLeaf.find((c) => c.strict) ??
    candidatesForLeaf.sort((a, b) => b.priority - a.priority)[0]!;

  return {
    status: "MATCHED",
    leafId: resolvedLeafId,
    needsReview: Boolean(needsReview),
    confidence: typeof confidence === "number" ? confidence : 0,
    ruleIdApplied: applied.ruleId,
    matchedKeyword: applied.matchedKeyword,
    candidates: candidatesForLeaf,
  };
}


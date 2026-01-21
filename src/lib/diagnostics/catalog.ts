import type { LucideIcon } from "lucide-react";
import {
  FileUp,
  Braces,
  ScanText,
  Database,
  Sparkles,
  Tags,
  GitBranch,
  ShieldAlert,
} from "lucide-react";

export type ConfidenceLabel = "raw-backed" | "DB-only (low confidence)";

export type { DiagnosticStage, Severity } from "@/lib/diagnostics/catalog-core";
import {
  DIAGNOSTIC_STAGES_CORE,
  DIAGNOSTICS_CATALOG_CORE,
  getCatalogItemCore,
  type DiagnosticCatalogItemCore,
} from "@/lib/diagnostics/catalog-core";

export interface DiagnosticCatalogItem {
  id: string;
  stage: DiagnosticCatalogItemCore["stage"];
  severityDefault: DiagnosticCatalogItemCore["severityDefault"];
  includeInHealthScoreByDefault: boolean;
  icon: LucideIcon;
  titlePt: string;
  whatHappenedPt: string;
  howWeKnowPt: string;
  approachPt: string;
  recommendedActionPt: string;
}

export const DIAGNOSTIC_STAGES: Array<{
  id: DiagnosticCatalogItemCore["stage"];
  titlePt: string;
  icon: LucideIcon;
  descriptionPt: string;
  approachPt: string;
}> = DIAGNOSTIC_STAGES_CORE.map((s) => ({
  ...s,
  icon:
    s.id === "raw"
      ? FileUp
      : s.id === "parsed"
        ? ScanText
        : s.id === "normalized"
          ? Braces
          : s.id === "db"
            ? Database
            : s.id === "rules"
              ? Sparkles
              : s.id === "categorization"
                ? Tags
                : GitBranch,
}));

export const DIAGNOSTICS_CATALOG: Record<string, DiagnosticCatalogItem> = {
  ...Object.fromEntries(
    Object.entries(DIAGNOSTICS_CATALOG_CORE).map(([id, item]) => [
      id,
      {
        ...item,
        icon: ShieldAlert,
      },
    ])
  ),
};

export function getCatalogItem(issueId: string): DiagnosticCatalogItem | undefined {
  const core = getCatalogItemCore(issueId);
  if (!core) return undefined;
  return { ...core, icon: ShieldAlert };
}

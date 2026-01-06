import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { statusPanelCopy, t as translate } from "@/lib/i18n";
import type { ReactNode } from "react";

type StatusVariant = "info" | "success" | "warning" | "error";

type StatusPanelProps = {
  title: string;
  description?: string;
  variant?: StatusVariant;
  meta?: Array<{ label: string; value: string }>;
  payload?: Record<string, unknown> | null;
  children?: ReactNode;
  className?: string;
};

const VARIANT_STYLES: Record<StatusVariant, { badge: string; panel: string }> = {
  info: { badge: "bg-sky-100 text-sky-700", panel: "border-sky-200 bg-sky-50" },
  success: { badge: "bg-emerald-100 text-emerald-700", panel: "border-emerald-200 bg-emerald-50" },
  warning: { badge: "bg-amber-100 text-amber-700", panel: "border-amber-200 bg-amber-50" },
  error: { badge: "bg-rose-100 text-rose-700", panel: "border-rose-200 bg-rose-50" },
};

export function StatusPanel({
  title,
  description,
  variant = "info",
  meta,
  payload,
  children,
  className,
}: StatusPanelProps) {
  const locale = useLocale();
  const styles = VARIANT_STYLES[variant];
  const variantLabels = statusPanelCopy.labels[variant] || statusPanelCopy.labels.info;

  return (
    <Card className={cn("border shadow-sm", styles.panel, className)}>
      <CardContent className="space-y-3 p-4 text-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{title}</p>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
          <Badge className={styles.badge}>{translate(locale, variantLabels)}</Badge>
        </div>

        {meta?.length ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 text-xs">
            {meta.map((item) => (
              <div key={`${item.label}-${item.value}`} className="rounded-md border border-white/40 bg-white/60 p-2">
                <p className="text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {children}

        {payload ? (
          <pre className="whitespace-pre-wrap rounded-md border border-white/50 bg-white/70 p-2 text-[11px] text-foreground">
            {JSON.stringify(payload, null, 2)}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  );
}

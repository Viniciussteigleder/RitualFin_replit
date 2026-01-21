"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/constants/categories";
import { Input } from "@/components/ui/input";

type Row = { name: string; average: number; total: number };

type LevelKey = "appCategory" | "category1" | "category2" | "category3";
type SortKey = "average" | "total";

function SpendAveragesTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as Row | undefined;
  if (!row?.name) return null;

  return (
    <div className="rounded-2xl border border-border bg-background/95 shadow-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <CategoryIcon category={row.name} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            Média: {formatCurrency(row.average, { hideDecimals: true })} • Total:{" "}
            {formatCurrency(row.total, { hideDecimals: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SpendAveragesChart({
  data,
}: {
  data:
    | {
        months: number;
        range: { start: string | Date; end: string | Date };
        appCategory: Row[];
        category1: Row[];
        category2: Row[];
        category3: Row[];
      }
    | Record<number, {
        months: number;
        range: { start: string | Date; end: string | Date };
        appCategory: Row[];
        category1: Row[];
        category2: Row[];
        category3: Row[];
      }>;
}) {
  const availableMonths = useMemo(() => {
    const keys = Object.keys(data)
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n) && Boolean((data as any)[n]));
    return keys.length ? keys.sort((a, b) => a - b) : [];
  }, [data]);

  const [monthsKey, setMonthsKey] = useState<number>(() => (availableMonths.length ? availableMonths[0] : 3));
  const [level, setLevel] = useState<LevelKey>("appCategory");
  const [limit, setLimit] = useState<number | "all">(8);
  const [sortKey, setSortKey] = useState<SortKey>("average");
  const [query, setQuery] = useState("");
  const [showOpen, setShowOpen] = useState(false);

  const dataset = useMemo(() => {
    if (availableMonths.length) return (data as any)[monthsKey] ?? (data as any)[availableMonths[0]];
    return data as any;
  }, [availableMonths, data, monthsKey]);

  const visible = useMemo(() => {
    const rows: Row[] = dataset[level] || [];
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (!showOpen && r.name === "OPEN") return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q);
    });

    const sorted = [...filtered].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]));
    return limit === "all" ? sorted : sorted.slice(0, limit);
  }, [dataset, level, limit, query, showOpen, sortKey]);

  const rangeLabel = useMemo(() => {
    const start = new Date(dataset.range.start);
    const end = new Date(dataset.range.end);
    const startLabel = start.toLocaleDateString("pt-PT", { month: "short", year: "numeric" });
    const endLabel = end.toLocaleDateString("pt-PT", { month: "short", year: "numeric" });
    return `${startLabel} – ${endLabel}`;
  }, [dataset.range.end, dataset.range.start]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-foreground font-display">Média de gastos (últimos {dataset.months} meses)</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{rangeLabel}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
          {availableMonths.length ? (
            <div className="flex bg-secondary rounded-xl p-1 gap-1">
              {availableMonths.map((m) => (
	                <button
                  key={m}
                  onClick={() => setMonthsKey(m)}
	                  className={cn(
	                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-[background-color,color,box-shadow,opacity] duration-150",
	                    monthsKey === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
	                  )}
	                >
                  {m}M
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex bg-secondary rounded-xl p-1 gap-1">
            {([
              ["appCategory", "App"],
              ["category1", "Cat 1"],
              ["category2", "Cat 2"],
              ["category3", "Cat 3"],
            ] as const).map(([key, label]) => (
	              <button
                key={key}
                onClick={() => setLevel(key)}
	                className={cn(
	                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-[background-color,color,box-shadow,opacity] duration-150",
	                  level === key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
	                )}
	              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex bg-secondary rounded-xl p-1 gap-1">
            {[5, 8, 12, "all"].map((opt) => (
	              <button
                key={String(opt)}
                onClick={() => setLimit(opt as any)}
	                className={cn(
	                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-[background-color,color,box-shadow,opacity] duration-150",
	                  limit === opt ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
	                )}
	              >
                {opt === "all" ? "Todas" : `Top ${opt}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex items-center justify-center min-h-[220px] text-muted-foreground opacity-60">
          Sem dados suficientes para o período.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar categoria…"
                className="h-10 w-full lg:w-72 rounded-2xl bg-secondary/30 border-border font-medium"
              />
	              <button
                type="button"
                onClick={() => setShowOpen((v) => !v)}
	                className={cn(
	                  "h-10 px-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-[background-color,border-color,color,box-shadow,opacity] duration-150",
	                  showOpen
	                    ? "bg-secondary border-border text-foreground"
	                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
	                )}
	              >
                {showOpen ? "Mostrar OPEN" : "Ocultar OPEN"}
              </button>
            </div>

            <div className="flex bg-secondary rounded-xl p-1 gap-1">
              {([
                ["average", "Ordenar: Média"],
                ["total", "Ordenar: Total"],
              ] as const).map(([k, label]) => (
	                <button
                  key={k}
                  onClick={() => setSortKey(k)}
	                  className={cn(
	                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-[background-color,color,box-shadow,opacity] duration-150",
	                    sortKey === k ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
	                  )}
	                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-3 rounded-2xl border border-border bg-secondary/10 p-4">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visible} layout="vertical" margin={{ left: 16, right: 16, top: 10, bottom: 10 }}>
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(Number(v), { hideDecimals: true })}
                    axisLine={false}
                    tickLine={false}
                    className="text-[10px] font-bold text-muted-foreground"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    className="text-[11px] font-bold text-foreground"
                  />
                  <Tooltip content={<SpendAveragesTooltip />} />
                  <Bar dataKey={sortKey} radius={[10, 10, 10, 10]} fill="hsl(var(--primary))">
                    {visible.map((r) => {
                      const c = getCategoryConfig(r.name);
                      return <Cell key={r.name} fill={c.color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              {visible.slice(0, 10).map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={r.name} size="sm" />
                    <span className="text-sm font-bold text-foreground truncate">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-foreground tabular-nums">
                    {formatCurrency(sortKey === "average" ? r.average : r.total, { hideDecimals: true })}
                  </span>
                </div>
              ))}
              {visible.length > 10 ? (
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  +{visible.length - 10} categorias
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

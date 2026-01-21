"use client";

import type { MonthByMonthRow, TopAggregateRow } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function MonthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = Number(payload[0]?.value || 0);
  return (
    <div className="rounded-2xl border border-border bg-background/95 shadow-xl px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(total, { hideDecimals: true })}</div>
    </div>
  );
}

export function MonthByMonthInsight({ rows }: { rows: MonthByMonthRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  const chartData = rows.map((r) => {
    const d = new Date(`${r.month}-01T00:00:00`);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    return { ...r, label };
  });

  return (
    <div className="bg-card/95 rounded-3xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-black text-foreground">Mês a mês</h3>
          <p className="text-sm text-muted-foreground font-semibold">
            Total no período: <span className="font-black text-foreground tabular-nums">{formatCurrency(total, { hideDecimals: true })}</span>
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">Sem dados para o período selecionado.</div>
      ) : (
        <div className="p-6">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-[11px] font-semibold text-muted-foreground" />
                <YAxis
                  tickFormatter={(v) => formatCurrency(Number(v), { hideDecimals: true })}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  className="text-[11px] font-semibold text-muted-foreground"
                />
                <Tooltip content={<MonthTooltip />} />
                <Bar dataKey="total" radius={[10, 10, 10, 10]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopListInsight({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: TopAggregateRow[];
  emptyText: string;
}) {
  const max = Math.max(0, ...rows.map((r) => r.total));

  return (
    <div className="bg-card/95 rounded-3xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-black text-foreground">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.map((r) => (
              <div
                key={r.name}
                className="group flex flex-col gap-3 p-4 rounded-2xl bg-background/60 border border-border hover:border-emerald-200/60 hover:shadow-sm transition-[border-color,box-shadow,background-color,color,opacity] duration-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground">
                      {r.name.substring(0, 1)}
                    </div>
                    <div className="font-black text-foreground truncate text-sm">{r.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-foreground tabular-nums">{formatCurrency(r.total, { hideDecimals: true })}</div>
                    <div className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {r.count} tx
                    </div>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden w-full">
                  <div
                    className="h-full rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors"
                    style={{ width: `${max > 0 ? Math.max(2, (r.total / max) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import type { MonthByMonthRow, TopAggregateRow } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function MonthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = Number(payload[0]?.value || 0);
  return (
    <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm shadow-xl px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(total, { hideDecimals: true })}</div>
    </div>
  );
}

export function MonthByMonthInsight({ rows }: { rows: MonthByMonthRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  const chartData = rows.map((r) => {
    const d = new Date(`${r.month}-01T00:00:00`);
    const label = d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" });
    return { ...r, label };
  });

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100/50 flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900">Mês a mês</h3>
          <p className="text-sm text-gray-500 font-medium">
            Total no período: <span className="font-bold text-gray-900 tabular-nums">{formatCurrency(total, { hideDecimals: true })}</span>
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
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100/50">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="p-4">
          <div className="grid gap-2">
            {rows.map((r) => (
              <div
                key={r.name}
                className="group flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-gray-900 truncate">{r.name}</div>
                    <div className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(r.total, { hideDecimals: true })}</div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors"
                      style={{ width: `${max > 0 ? Math.max(2, (r.total / max) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
                  {r.count} tx
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


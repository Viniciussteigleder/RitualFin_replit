"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { getCategoryConfig } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

interface CategoryData {
  name: string;
  value: number;
}

function CategoryChartTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as CategoryData | undefined;
  if (!entry?.name) return null;
  const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-background/95 shadow-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <CategoryIcon category={entry.name} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{entry.name}</span>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {formatCurrency(entry.value, { hideDecimals: true })} • {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoryChart({ data, total }: { data: CategoryData[], total: number }) {
  const router = useRouter();
  const [viewLimit, setViewLimit] = useState<number | 'all'>(5);

  if (!data || data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground opacity-50">
            <p className="text-sm font-medium">Sem dados de categorias</p>
        </div>
    )
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const visibleData = viewLimit === 'all' ? sortedData : sortedData.slice(0, viewLimit);

  // For the actual chart, we limit to 8 + other if needed
  const chartSlices = sortedData.slice(0, 8);
  if (sortedData.length > 8) {
    chartSlices.push({
      name: 'Outros',
      value: sortedData.slice(8).reduce((sum, item) => sum + item.value, 0)
    });
  }

  const handleSliceClick = (slice: any) => {
    const name = slice?.name;
    if (typeof name === "string" && name.length) {
      router.push(`/transactions?category=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
        {/* Header Options */}
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground font-display">Gastos por Categoria</h3>
            <div className="flex bg-secondary rounded-lg p-1 gap-1">
                {[5, 8, 'all'].map((opt) => (
	                    <button
	                        key={opt}
	                        onClick={() => setViewLimit(opt as any)}
	                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-[background-color,color,box-shadow,opacity] duration-150 ${viewLimit === opt ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
	                    >
                        {opt === 'all' ? 'Todas' : `Top ${opt}`}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 w-full">
        {/* Chart */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-[240px] sm:h-[260px] flex-shrink-0 mx-auto md:mx-0">
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none pb-2">
                <span className="text-2xl font-bold font-display text-foreground">{formatCurrency(total, { hideDecimals: true })}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Gasto</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartSlices}
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={12}
                  onClick={handleSliceClick}
                  className="focus:outline-none"
                >
                  {chartSlices.map((entry, index) => {
                    const config = getCategoryConfig(entry.name);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={config.color}
                        className="cursor-pointer hover:opacity-85 transition-opacity outline-none"
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CategoryChartTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Legend / List */}
        <div className="flex flex-col gap-5 w-full">
            {visibleData.map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const config = getCategoryConfig(item.name);
                return (
                    <div
                        key={item.name}
                        className="flex flex-col gap-2 w-full group cursor-pointer"
                        onClick={() => router.push(`/transactions?category=${encodeURIComponent(item.name)}`)}
                    >
                        <div className="flex items-center justify-between text-sm font-bold">
                            <div className="flex items-center gap-3">
                                <CategoryIcon category={item.name} size="md" className="transition-transform group-hover:scale-110" />
                                <span className="text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground font-medium">{formatCurrency(item.value, { hideDecimals: true })}</span>
                                <span className="text-foreground bg-secondary px-2.5 py-1 rounded-lg text-[10px] font-black">{percent}%</span>
                            </div>
                        </div>
                        {/* Semantic Progress Bar */}
	                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
	                            <div 
	                                className="h-full rounded-full transition-[width,opacity] duration-700 ease-out" 
	                                style={{ width: `${percent}%`, backgroundColor: config.color }}
	                            />
	                        </div>
                    </div>
                )
            })}
        </div>
        </div>
    </div>
  );
}

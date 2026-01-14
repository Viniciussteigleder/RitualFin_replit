"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { getCategoryConfig } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

interface CategoryData {
  name: string;
  value: number;
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
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewLimit === opt ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {opt === 'all' ? 'Todas' : `Top ${opt}`}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 w-full">
        {/* Chart */}
        <div className="relative w-[220px] h-[220px] flex-shrink-0 mx-auto md:mx-0">
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none pb-2">
                <span className="text-2xl font-bold font-display text-foreground">{formatCurrency(total, { hideDecimals: true })}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Gasto</span>
            </div>
            <PieChart width={220} height={220}>
            <Pie
                data={chartSlices}
                cx={110}
                cy={110}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={12}
                onClick={(d) => router.push(`/transactions?category=${encodeURIComponent(d.name)}`)}
                className="focus:outline-none"
            >
                {chartSlices.map((entry, index) => {
                    const config = getCategoryConfig(entry.name);
                    return <Cell key={`cell-${index}`} fill={config.color} className="cursor-pointer hover:opacity-80 transition-opacity outline-none" />;
                })}
            </Pie>
            <Tooltip
                formatter={(value: number) => formatCurrency(value, { hideDecimals: true })}
                contentStyle={{ backgroundColor: "#111816", border: "none", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold" }}
            />
            </PieChart>
        </div>

        {/* Legend / List */}
        <div className="flex flex-col gap-5 w-full">
            {visibleData.map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const config = getCategoryConfig(item.name);
                const Icon = config.lucideIcon;
                return (
                    <div
                        key={item.name}
                        className="flex flex-col gap-2 w-full group cursor-pointer"
                        onClick={() => router.push(`/transactions?category=${encodeURIComponent(item.name)}`)}
                    >
                        <div className="flex items-center justify-between text-sm font-bold">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110", config.bgColor, config.textColor)}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
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
                                className={cn("h-full rounded-full transition-all duration-1000", config.progressColor)} 
                                style={{ width: `${percent}%` }}
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

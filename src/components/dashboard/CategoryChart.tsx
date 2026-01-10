"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = [
  "#F97316", // Orange
  "#3B82F6", // Blue
  "#A855F7", // Purple
  "#22C55E", // Green
  "#EC4899", // Pink
  "#EAB308", // Yellow
];

export function CategoryChart({ data, total }: { data: CategoryData[], total: number }) {
  const router = useRouter();
  if (!data || data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground opacity-50">
            <p className="text-sm font-medium">Sem dados de categorias</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 w-full">
      {/* Chart */}
      <div className="relative w-[200px] h-[200px] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none">
            <span className="text-2xl font-bold font-display text-foreground">{formatCurrency(total)}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Gasto</span>
        </div>
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx={95} // shifted slightly
            cy={95}
            innerRadius={65}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
            onClick={(d) => router.push(`/transactions?category=${encodeURIComponent(d.name)}`)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ backgroundColor: "#111816", border: "none", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold" }}
          />
        </PieChart>
      </div>

      {/* Legend / List */}
      <div className="flex flex-col gap-4 w-full">
        {data.map((item, index) => {
            const percent = Math.round((item.value / total) * 100);
            return (
                <div key={item.name} className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center" 
                                style={{ backgroundColor: `${COLORS[index % COLORS.length]}15`, color: COLORS[index % COLORS.length] }}
                            >
                                {/* We could use icons here if mapped, for now using just color block info */}
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            </div>
                            <span className="text-foreground">{item.name}</span>
                        </div>
                        <span className="text-foreground">{percent}%</span>
                    </div>
                    {/* Semantic Progress Bar */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full" 
                            style={{ width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }}
                        />
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}

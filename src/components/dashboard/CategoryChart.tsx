"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  ShoppingCart, Home, Car, Heart, Smile, Plane, Utensils, Briefcase, HelpCircle, Activity, LayoutGrid
} from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6"];

const getIconForCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('mercado') || n.includes('super') || n.includes('alimentação')) return ShoppingCart;
  if (n.includes('moradia') || n.includes('casa') || n.includes('aluguel')) return Home;
  if (n.includes('transporte') || n.includes('carro') || n.includes('uber') || n.includes('combustível')) return Car;
  if (n.includes('saúde') || n.includes('farmácia') || n.includes('médico')) return Heart;
  if (n.includes('lazer') || n.includes('diversão') || n.includes('cinema')) return Smile;
  if (n.includes('viagem') || n.includes('turismo')) return Plane;
  if (n.includes('restaurante') || n.includes('comida') || n.includes('ifood')) return Utensils;
  if (n.includes('serviço') || n.includes('trabalho')) return Briefcase;
  if (n.includes('assinatura') || n.includes('net') || n.includes('tv')) return LayoutGrid;
  return HelpCircle;
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

  const visibleData = viewLimit === 'all' ? data : data.slice(0, viewLimit);
  const otherTotal = data.slice(typeof viewLimit === 'number' ? viewLimit : data.length).reduce((acc, curr) => acc + curr.value, 0);

  // Use a cleaner data set for the chart itself (always restrict chart segments to avoid clutter, e.g. top 8 + others)
  const chartData = viewLimit === 'all'
     ? [...data.slice(0, 8), { name: 'Outros', value: data.slice(8).reduce((sum, item) => sum + item.value, 0) }]
     : visibleData;

  // Ensure no zero values
  const finalChartData = chartData.filter(d => d.value > 0);

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

        <div className="flex flex-col md:flex-row items-start gap-8 w-full">
        {/* Chart */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0 mx-auto md:mx-0">
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none">
                <span className="text-2xl font-bold font-display text-foreground">{formatCurrency(total, { hideDecimals: true })}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Gasto</span>
            </div>
            <PieChart width={200} height={200}>
            <Pie
                data={finalChartData}
                cx={95}
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
                {finalChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip
                formatter={(value: number) => formatCurrency(value, { hideDecimals: true })}
                contentStyle={{ backgroundColor: "#111816", border: "none", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold" }}
            />
            </PieChart>
        </div>

        {/* Legend / List */}
        <div className="flex flex-col gap-4 w-full">
            {visibleData.map((item, index) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const Icon = getIconForCategory(item.name);
                return (
                    <div
                        key={item.name}
                        className="flex flex-col gap-1 w-full group cursor-pointer"
                        onClick={() => router.push(`/transactions?category=${encodeURIComponent(item.name)}`)}
                    >
                        <div className="flex items-center justify-between text-sm font-bold">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                    style={{ backgroundColor: `${COLORS[index % COLORS.length]}15`, color: COLORS[index % COLORS.length] }}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">{formatCurrency(item.value, { hideDecimals: true })}</span>
                                <span className="text-foreground bg-secondary px-2 py-0.5 rounded-full text-[10px]">{percent}%</span>
                            </div>
                        </div>
                        {/* Semantic Progress Bar */}
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}

"use client";

import { MonthByMonthRow } from "@/lib/actions/analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendViewProps {
  data: MonthByMonthRow[];
}

export function TrendView({ data }: TrendViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6">Evolução Mensal</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(val) => `R$ ${val / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-lg">
                        <p className="font-bold mb-1">{label}</p>
                        <p className="text-emerald-500 font-mono">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(payload[0].value))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {payload[0].payload.count} transações
                        </p>
                        </div>
                    );
                    }
                    return null;
                }}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[6, 6, 0, 0]}
                className="fill-primary hover:fill-primary/80 transition-all"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

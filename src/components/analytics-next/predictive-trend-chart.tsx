"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useSpendingForecast } from "@/hooks/use-spending-forecast";

interface MonthlyData {
  month: string;
  outcome: number;
  income: number;
}

interface PredictiveTrendChartProps {
  data: MonthlyData[];
}

export function PredictiveTrendChart({ data }: PredictiveTrendChartProps) {
  const forecast = useSpendingForecast(data);

  // Prepare data for the chart: Add a "Forecast" point for next month
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Base data
    const formattedData = data.map((d, i) => ({
      ...d,
      index: i,
      // We can add a trend line value here based on the slope if we want a continuous line
      trendLine: forecast ? (forecast.slope * i) + (data[0].outcome - (forecast.slope * 0)) : null,
      // Fake confidence interval around the trend line (just for visual representation of 'range')
      ciUpper: forecast ? ((forecast.slope * i) + (data[0].outcome)) * 1.1 : null,
      ciLower: forecast ? ((forecast.slope * i) + (data[0].outcome)) * 0.9 : null,
    }));

    // If we have a forecast, append a hypothetical next month
    if (forecast) {
       // Rough approximation of next month label
       const lastMonth = new Date(data[data.length - 1].month);
       lastMonth.setMonth(lastMonth.getMonth() + 1);
       const nextMonthLabel = lastMonth.toISOString().slice(0, 7); // YYYY-MM
       
       const predicted = forecast.predictedAmount;

       formattedData.push({
           month: nextMonthLabel + "*", // Asterisk for forecast
           outcome: 0, // No actual outcome
           income: 0,
           index: data.length,
           trendLine: predicted,
           // Specialized 'forecast' key for the dotted line
           forecast: predicted,
           // Expand CI for future
           ciUpper: predicted * 1.2,
           ciLower: predicted * 0.8,
           isForecast: true
       } as any);
    }

    return formattedData;
  }, [data, forecast]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          
          <XAxis 
            dataKey="month" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `k${(value / 1000).toFixed(0)}`}
          />
          
          <Tooltip
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border p-3 rounded-lg shadow-md">
                    <p className="font-semibold text-foreground mb-2 text-xs">{label}</p>
                    {payload.map((entry: any) => {
                      if (entry.dataKey === 'ciUpper' || entry.dataKey === 'ciLower' || entry.dataKey === 'trendLine') return null;
                      
                      const isExpense = entry.name === 'Despesa';
                      const isIncome = entry.name === 'Receita';
                      
                      return (
                        <div key={entry.name} className="flex items-center gap-4 text-sm mb-1 last:mb-0">
                          <div className="flex items-center gap-2">
                             <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground capitalize">{entry.name}</span>
                          </div>
                          <span className={isExpense ? "text-red-600 dark:text-red-400 font-medium tabular-nums shadow-none" : isIncome ? "text-emerald-600 dark:text-emerald-400 font-medium tabular-nums shadow-none" : "text-foreground font-medium tabular-nums"}>
                             {formatCurrency(entry.value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Main Bars - Solid, contrasting colors */}
          <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} name="Receita" fillOpacity={0.8} />
          <Bar dataKey="outcome" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={20} name="Despesa" fillOpacity={0.8} />
          
          {/* Forecast Line - Distinct but professional */}
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="hsl(var(--foreground))" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "hsl(var(--foreground))", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Previsão"
            connectNulls
            opacity={0.6}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

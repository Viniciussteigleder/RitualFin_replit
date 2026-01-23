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
          margin={{ top: 20, right: 10, bottom: 20, left: -20 }}
        >
          {/* Tufte: No Grid Lines */}
          <CartesianGrid vertical={false} horizontal={false} />
          
          <defs>
             {/* Gradient for bars - Deep Neon */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
            
            {/* Glow Filter for Lines */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
          </defs>

          <XAxis 
            dataKey="month" 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500, fontFamily: "monospace" }} 
            tickLine={false}
            axisLine={false}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500, fontFamily: "monospace" }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `k${(value / 1000).toFixed(0)}`} // Simplify to 'k'
            dx={-10}
          />
          
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[200px]">
                    <p className="font-mono text-white mb-3 text-[10px] tracking-widest uppercase opacity-50 border-b border-white/10 pb-2">{label}</p>
                    {payload.map((entry: any) => {
                      if (entry.dataKey === 'ciUpper' || entry.dataKey === 'ciLower' || entry.dataKey === 'trendLine') return null;
                      
                      const isExpense = entry.name === 'Despesa';
                      const isIncome = entry.name === 'Receita';
                      const isForecast = entry.name === 'Previsão';
                      
                      return (
                        <div key={entry.name} className="flex items-center justify-between gap-6 text-sm mb-2 last:mb-0">
                          <div className="flex items-center gap-2">
                             <div 
                                className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" 
                                style={{ backgroundColor: entry.color, color: entry.color }}
                            />
                            <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">{entry.name}</span>
                          </div>
                          <span className={isExpense ? "text-red-400 font-mono" : isIncome ? "text-emerald-400 font-mono" : "text-purple-400 font-mono"}>
                             {formatCurrency(entry.value)}
                          </span>
                        </div>
                      )
                    })}
                    {/* Add predictive insight text if forecast is present */}
                    {label && label.toString().includes("*") && (
                        <div className="mt-3 text-[10px] text-purple-300 font-medium border-t border-purple-500/20 pt-2 flex items-center gap-1 animate-pulse">
                            <span>🔮</span>
                            <span className="uppercase tracking-widest">AI Forecast</span>
                        </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Main Bars */}
          <Bar dataKey="income" fill="url(#incomeGradient)" radius={[2, 2, 0, 0]} barSize={12} name="Receita" />
          <Bar dataKey="outcome" fill="url(#expenseGradient)" radius={[2, 2, 0, 0]} barSize={12} name="Despesa" />
          
          {/* Forecast Line with Glow */}
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#A78BFA" 
            strokeWidth={2} 
            strokeDasharray="4 4" 
            strokeLinecap="round"
            dot={{ r: 3, fill: "#A78BFA", strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            name="Previsão"
            connectNulls
            filter="url(#glow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

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
          
          <XAxis 
            dataKey="month" 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }} 
            tickLine={false}
            axisLine={false}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `k${(value / 1000).toFixed(0)}`} // Simplify to 'k'
            dx={-10}
          />
          
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-black/80 backdrop-blur-3xl border border-white/5 p-4 rounded-2xl shadow-2xl">
                    <p className="font-bold text-white mb-3 text-xs tracking-wider uppercase opacity-70">{label}</p>
                    {payload.map((entry: any) => {
                      if (entry.dataKey === 'ciUpper' || entry.dataKey === 'ciLower' || entry.dataKey === 'trendLine') return null;
                      
                      const isExpense = entry.name === 'Despesa';
                      const isIncome = entry.name === 'Receita';
                      
                      return (
                        <div key={entry.name} className="flex items-center justify-between gap-6 text-sm mb-1 last:mb-0">
                          <div className="flex items-center gap-2">
                             <div 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-400">{entry.name}</span>
                          </div>
                          <span className={isExpense ? "text-red-400 font-bold tabular-nums" : isIncome ? "text-emerald-400 font-bold tabular-nums" : "text-white font-bold tabular-nums"}>
                             {formatCurrency(entry.value)}
                          </span>
                        </div>
                      )
                    })}
                    {/* Add predictive insight text if forecast is present */}
                    {label && label.toString().includes("*") && (
                        <div className="mt-3 text-[10px] text-indigo-300 font-medium border-t border-white/10 pt-2 flex items-center gap-1">
                            <span>🤖</span> Estimativa Inteligente
                        </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <defs>
             {/* Gradient for bars */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3}/>
            </linearGradient>
            {/* Gradient for CI Area */}
             <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01}/>
            </linearGradient>
          </defs>

          {/* Confidence Interval (Area) */}
          {/* We hack this by stacking two areas or using a range area if recharts supported it well. 
              Here simplified: Just a shaded area under the trend line for visual depth */}
          
          <Bar dataKey="income" fill="url(#incomeGradient)" radius={[4, 4, 0, 0]} barSize={24} name="Receita" />
          <Bar dataKey="outcome" fill="url(#expenseGradient)" radius={[4, 4, 0, 0]} barSize={24} name="Despesa" />
          
          {/* Forecast Line (Dotted for lighter feel) */}
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#8B5CF6" 
            strokeWidth={3} 
            strokeDasharray="1 6" 
            strokeLinecap="round"
            dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Previsão"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

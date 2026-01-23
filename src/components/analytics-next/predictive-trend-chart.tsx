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
      trendLine: forecast ? (forecast.slope * i) + (data[0].outcome - (forecast.slope * 0)) : null // Simplified intercept approx
    }));

    // If we have a forecast, append a hypothetical next month
    if (forecast) {
       // Rough approximation of next month label
       const lastMonth = new Date(data[data.length - 1].month);
       lastMonth.setMonth(lastMonth.getMonth() + 1);
       const nextMonthLabel = lastMonth.toISOString().slice(0, 7); // YYYY-MM
       
       formattedData.push({
           month: nextMonthLabel + " (Forecast)",
           outcome: 0, // No actual outcome
           income: 0,
           index: data.length,
           trendLine: forecast.predictedAmount, // This might be discontinuous, better to chart separate point
           // specialized 'forecast' key
           forecast: forecast.predictedAmount
       } as any);
    }

    return formattedData;
  }, [data, forecast]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: "#a3a3a3", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: "#a3a3a3", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `€${value.toLocaleString()}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl">
                    <p className="font-bold text-white mb-2">{label}</p>
                    {payload.map((entry: any) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300 capitalize">{entry.name}:</span>
                        <span className="font-mono text-white">
                          {formatCurrency(entry.value)}
                        </span>
                      </div>
                    ))}
                    {/* Add predictive insight text if forecast is present */}
                    {label.includes("Forecast") && (
                        <div className="mt-2 text-xs text-indigo-400 font-medium border-t border-white/10 pt-2">
                            🤖 AI Prediction
                        </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.6} name="Receita" />
          <Bar dataKey="outcome" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} name="Despesa" />
          
          {/* Forecast Line (Dashed) */}
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#8B5CF6" 
            strokeWidth={3} 
            strokeDasharray="5 5" 
            dot={{ r: 6, fill: "#8B5CF6", strokeWidth: 2, stroke: "#fff" }}
            name="Previsão"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

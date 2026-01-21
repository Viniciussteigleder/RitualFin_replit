"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function ForecastCard({ dailyForecast }: { dailyForecast: number }) {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", { 
      style: "currency", 
      currency: "EUR",
      minimumFractionDigits: 2
    }).format(value);
  };

  const value = view === "daily" ? dailyForecast : dailyForecast * 7;
  const label = view === "daily" ? "Gasto médio diário (30 dias)" : "Projeção de gasto semanal";

  return (
    <Card className="rounded-[2rem] border-border bg-foreground text-background shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,opacity] duration-200 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-40"></div>
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-foreground/60 uppercase tracking-widest">Previsão</span>
            <div className="bg-white/10 p-1 rounded-xl flex items-center">
              <button 
                onClick={() => setView("daily")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-[background-color,color,opacity] duration-150 ${view === "daily" ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
              >
                Diária
              </button>
              <button 
                onClick={() => setView("weekly")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-[background-color,color,opacity] duration-150 ${view === "weekly" ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}
              >
                Semanal
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-white font-display">{formatCurrency(value)}</h3>
            <p className="text-xs text-white/40 mt-1 font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

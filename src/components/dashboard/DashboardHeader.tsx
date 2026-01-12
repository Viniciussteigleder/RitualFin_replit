"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths, parse } from "date-fns";
import { pt } from "date-fns/locale";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";

export function DashboardHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentMonthStr = searchParams.get("month") || format(new Date(), "yyyy-MM");
  const currentDate = parse(currentMonthStr, "yyyy-MM", new Date());

  const handleMonthChange = (direction: 'next' | 'prev') => {
    const newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    const newMonthStr = format(newDate, "yyyy-MM");
    const params = new URLSearchParams(searchParams);
    params.set("month", newMonthStr);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 px-1">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Dashboard</h2>
          <p className="text-muted-foreground font-medium">Controle total do seu fluxo financeiro em tempo real.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <ReRunRulesButton />
          
          <div className="flex items-center bg-card rounded-2xl shadow-sm p-1.5 border border-border w-full sm:w-auto justify-between sm:justify-start">
            <button 
                onClick={() => handleMonthChange('prev')}
                className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center gap-2 px-6 min-w-[140px]">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground whitespace-nowrap capitalize">
                {format(currentDate, "MMMM yyyy", { locale: pt })}
              </span>
            </div>
            <button 
                onClick={() => handleMonthChange('next')}
                className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
  );
}

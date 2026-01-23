"use client";

import { DrillDownData } from "@/lib/actions/analytics";
import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { ChevronRight, ExternalLink, ArrowDown, Search, Home, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BreakdownViewProps {
  data: DrillDownData;
}

export function BreakdownView({ data }: BreakdownViewProps) {
  const { updateParams, params } = useAnalyticsQuery();

  const handleDrill = (category: string) => {
    // Determine next filter key based on current level
    const current = data.currentLevel;
    let updates: any = {};

    if (current === "appCategory") updates = { appCategory: category, category1: undefined, category2: undefined, category3: undefined };
    else if (current === "category1") updates = { category1: category, category2: undefined, category3: undefined };
    else if (current === "category2") updates = { category2: category, category3: undefined };
    else if (current === "category3") updates = { category3: category };

    updateParams(updates);
  };

  const handleBreadcrumbClick = (index: number) => {
      // Logic to roll back filters based on breadcrumb index
      // If index is -1 (Home/Reset)
      if (index === -1) {
          updateParams({ appCategory: "", category1: "", category2: "", category3: "" });
          return;
      }

      const newParams: any = { appCategory: "", category1: "", category2: "", category3: "" };
      
      // Re-apply filters up to index
      // Correction: breadcrumb array is [App, Cat1, Cat2]. 
      // If I click index 0 (App), I want to keep App, clear Cat1/2/3.
      if (index >= 0) newParams.appCategory = data.breadcrumb[0].value;
      if (index >= 1) newParams.category1 = data.breadcrumb[1].value;
      if (index >= 2) newParams.category2 = data.breadcrumb[2].value;
      
      updateParams(newParams);
  };

  const formatMoney = (val: number) => 
     new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAggregates = data.aggregates.filter(item => 
      !searchTerm || item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/50 p-2 sm:p-3 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto no-scrollbar">
            <button 
                onClick={() => handleBreadcrumbClick(-1)}
                className="hover:text-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1.5"
            >
               <Home className="w-4 h-4" />
               <span className="sr-only sm:not-sr-only">Início</span>
            </button>
            {data.breadcrumb.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5 shrink-0">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    <button
                        onClick={() => handleBreadcrumbClick(idx)}
                        className={cn(
                            "hover:text-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap",
                            idx === data.breadcrumb.length - 1 ? "text-foreground font-bold bg-background shadow-xs border border-border/60" : ""
                        )}
                    >
                        {crumb.value || crumb.label}
                    </button>
                </div>
            ))}
            {data.breadcrumb.length > 0 && <span className="text-muted-foreground/30 mx-1">|</span>}
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider font-bold whitespace-nowrap">
                {data.currentLevel === "transactions" ? "Transações" : "Categorias"}
            </span>
          </div>

          {data.currentLevel !== "transactions" && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Buscar categoria..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-muted-foreground/70"
                />
              </div>
          )}
      </div>

      {/* Main Content: Table or List */}
      {data.currentLevel === "transactions" ? (
         <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
         <Table>
             <TableHeader className="bg-secondary/40">
                 <TableRow className="hover:bg-transparent">
                     <TableHead className="w-[120px]">Data</TableHead>
                     <TableHead>Descrição</TableHead>
                     <TableHead>Conta</TableHead>
                     <TableHead className="text-right">Valor</TableHead>
                 </TableRow>
             </TableHeader>
             <TableBody>
                 {data.transactions?.map((tx) => (
                     <TableRow key={tx.id} className="group hover:bg-muted/40 transition-colors">
                         <TableCell className="font-medium text-muted-foreground text-xs py-4">
                             {new Date(tx.paymentDate).toLocaleDateString("pt-BR", {day: "2-digit", month: "short"})}
                         </TableCell>
                         <TableCell className="py-4">
                             <div className="flex flex-col gap-0.5">
                                 <span className="font-bold text-foreground">{tx.aliasDesc || tx.descNorm || tx.descRaw}</span>
                                 <span className="text-xs text-muted-foreground">{tx.category3 || tx.category2}</span>
                             </div>
                         </TableCell>
                         <TableCell className="text-xs text-muted-foreground py-4">
                            Conta
                         </TableCell>
                         <TableCell className={cn("text-right font-bold text-sm py-4", tx.amount < 0 ? "text-red-500" : "text-emerald-600")}>
                             {formatMoney(tx.amount)}
                         </TableCell>
                     </TableRow>
                 ))}
             </TableBody>
         </Table>
         </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAggregates.map((item, idx) => (
                  <div 
                    key={item.category}
                    onClick={() => handleDrill(item.category)}
                    className="group relative flex flex-col justify-between bg-black/20 hover:bg-white/5 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                        {/* Background Scan Line (On Hover) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                        <div className="flex items-start justify-between mb-3 relative z-10">
                             <div className="flex flex-col">
                                <span className={cn(
                                    "font-medium text-sm transition-colors flex items-center gap-2",
                                    item.category === "OPEN" ? "text-orange-400" : "text-white/90 group-hover:text-emerald-300"
                                )}>
                                    {item.category === 'OPEN' ? 'UNCLASSIFIED' : item.category}
                                    {item.category === 'OPEN' && <AlertCircle className="w-3 h-3 text-orange-400" />}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mt-0.5">
                                    {item.count} OPS
                                </span>
                             </div>
                             
                             <span className="font-mono text-lg text-white font-light tracking-tight tabular-nums group-hover:text-glow transition-all">
                                {formatMoney(item.total)}
                             </span>
                        </div>

                        {/* Tech Progress Bar */}
                        <div className="space-y-1 relative z-10">
                            <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase">
                                <span>Impact</span>
                                <span>{item.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 rounded-sm overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out",
                                        item.category === "OPEN" ? "bg-orange-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                        
                        <ChevronRight className="absolute right-2 bottom-2 w-3 h-3 text-white/10 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
              ))}
               {filteredAggregates.length === 0 && (
                  <div className="col-span-full text-center py-20 text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-sm font-mono uppercase tracking-widest">No signals found for "{searchTerm}"</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
}

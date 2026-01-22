"use client";

import { DrillDownData } from "@/lib/actions/analytics";
import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { ChevronRight, ExternalLink, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

      // Check `data.breadcrumb` structure.
      // breadcrumb = [{ label: "App", value: "Food" }, { label: "Cat1", value: "Groceries" }]
      // Clicking index 0 (App: Food) -> Keep App, clear rest.
      // But breadcrumb array usually represents *applied* filters.
      // So if I click index 0, I want to go to that level? No, I am *at* child of index 0.
      // Actually, breadcrumbs usually show the *path taken*.
      // So if I am at "Groceries", path is "Food > Groceries".
      // If I click "Food" (index 0), I want to reset Cat1 to undefined, keep App.
      
      const newParams: any = { appCategory: "", category1: "", category2: "", category3: "" };
      
      // Re-apply filters up to index
      if (index >= 0) newParams.appCategory = data.breadcrumb[0].value;
      if (index >= 1) newParams.category1 = data.breadcrumb[1].value;
      if (index >= 2) newParams.category2 = data.breadcrumb[2].value;
      
      updateParams(newParams);
  };

  const formatMoney = (val: number) => 
     new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 p-3 rounded-xl border border-border/50">
        <button 
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors font-medium"
        >
            Início
        </button>
        {data.breadcrumb.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <button
                    onClick={() => handleBreadcrumbClick(idx)}
                    className={cn(
                        "hover:text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors font-medium",
                        idx === data.breadcrumb.length - 1 ? "text-foreground font-bold bg-background shadow-sm border border-border/50" : ""
                    )}
                >
                    {crumb.value || crumb.label}
                </button>
            </div>
        ))}
        {data.breadcrumb.length > 0 && <span className="text-muted-foreground/50 mx-2">|</span>}
        <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {data.currentLevel === "transactions" ? "Transações" : "Categorias"}
        </span>
      </div>

      {/* Main Content: Table or List */}
      {data.currentLevel === "transactions" ? (
         <Table className="bg-card rounded-2xl border border-border overflow-hidden">
             <TableHeader className="bg-secondary/30">
                 <TableRow>
                     <TableHead>Data</TableHead>
                     <TableHead>Descrição</TableHead>
                     <TableHead>Conta</TableHead>
                     <TableHead className="text-right">Valor</TableHead>
                 </TableRow>
             </TableHeader>
             <TableBody>
                 {data.transactions?.map((tx) => (
                     <TableRow key={tx.id} className="group hover:bg-muted/50 cursor-default">
                         <TableCell className="font-medium text-muted-foreground text-xs">
                             {new Date(tx.paymentDate).toLocaleDateString()}
                         </TableCell>
                         <TableCell>
                             <div className="flex flex-col">
                                 <span className="font-semibold text-foreground">{tx.aliasDesc || tx.descNorm || tx.descRaw}</span>
                                 <span className="text-xs text-muted-foreground">{tx.category3 || tx.category2}</span>
                             </div>
                         </TableCell>
                         <TableCell className="text-xs text-muted-foreground">
                             {/* Account ID/Name would be here if joined, for now plain text */}
                            Conta
                         </TableCell>
                         <TableCell className={cn("text-right font-bold text-sm", tx.amount < 0 ? "text-red-500" : "text-emerald-600")}>
                             {formatMoney(tx.amount)}
                         </TableCell>
                     </TableRow>
                 ))}
             </TableBody>
         </Table>
      ) : (
          <div className="grid gap-3">
              {/* Custom List Rendering for Categories with Visual Bar */}
              {data.aggregates.map((item) => (
                  <div 
                    key={item.category}
                    onClick={() => handleDrill(item.category)}
                    className="group relative flex items-center gap-4 bg-card hover:bg-secondary/40 p-4 rounded-xl border border-border transition-all cursor-pointer hover:shadow-md hover:border-emerald-500/30"
                  >
                        {/* Progress Bar Background */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-secondary/50 transition-all duration-500 rounded-l-xl opacity-20 group-hover:opacity-30 group-hover:bg-emerald-500/20"
                            style={{ width: `${item.percentage}%` }}
                        />

                        <div className="flex-1 flex flex-col z-10">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-lg text-foreground group-hover:text-emerald-700 transition-colors">
                                    {item.category === 'OPEN' ? 'Sem Categoria' : item.category}
                                </span>
                                <span className="font-bold text-lg tabular-nums">
                                    {formatMoney(item.total)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{item.count} transaç{item.count > 1 ? 'ões' : 'ão'}</span>
                                <span className="font-medium">{item.percentage.toFixed(1)}% do total</span>
                            </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

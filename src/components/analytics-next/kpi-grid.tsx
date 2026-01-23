import { DrillDownData } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils"; // Assuming this exists, or I'll inline it
import { TrendingDown, TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiGridProps {
  data: DrillDownData;
}

export function KpiGrid({ data }: KpiGridProps) {
  const total = data.totalAmount;
  const topCategory = data.aggregates[0];
  const categoryCount = data.aggregates.length;

  // Ideally we would have "Previous Period" data passed here too for deltas.
  // For now, we render valid stats based on what we have.

  const formatMoney = (val: number) => 
     new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total do Período
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatMoney(total)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {/* Placeholder for delta */}
            baseado em filtros atuais
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Maior Categoria
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={topCategory?.category}>
            {topCategory?.category || "-"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {topCategory ? formatMoney(topCategory.total) : "0"} ({topCategory?.percentage.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>
      
       <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Categorias Ativas
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoryCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            neste nível de visão
          </p>
        </CardContent>
      </Card>

       {/* Placeholder for a useful 4th metric, maybe "Avg/Day" if we had day count or transaction count */}
       <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transações
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.aggregates.reduce((acc, curr) => acc + curr.count, 0)}
          </div>
           <p className="text-xs text-muted-foreground mt-1">
            registros encontrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

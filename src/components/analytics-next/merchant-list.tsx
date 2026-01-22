"use client";

import { TopAggregateRow } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils"; // Assuming helper
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface MerchantListProps {
  data: TopAggregateRow[];
  title?: string;
}

export function MerchantList({ data, title = "Top Comerciantes" }: MerchantListProps) {
  const maxTotal = Math.max(...data.map(d => d.total), 1);

   const formatMoney = (val: number) => 
     new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/40">
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow>
            <TableHead className="w-[40%]">Nome</TableHead>
            <TableHead className="w-[30%] text-right pr-4">Total</TableHead>
            <TableHead className="text-right">Transações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium text-foreground">
                {item.name}
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex flex-col gap-1 items-end">
                    <span className="font-bold">{formatMoney(item.total)}</span>
                    <Progress value={(item.total / maxTotal) * 100} className="h-1.5 bg-secondary w-24" indicatorClassName="bg-emerald-500" />
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {item.count}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
              <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Nenhum dado encontrado para este período.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

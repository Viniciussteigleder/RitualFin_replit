"use client";

import { TopAggregateRow } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils";
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
    <div className="w-full">
      <Table>
        <TableHeader className="opacity-0 h-0 pointer-events-none">
           {/* Visual header handled in parent card, kept here for a11y */}
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i} className="group hover:bg-white/5 transition-colors border-none">
              <TableCell className="py-3 pl-2">
                <div className="flex items-center gap-3">
                    {/* Placeholder Avatar */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 ring-1 ring-white/10">
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white/90 text-sm truncate max-w-[120px]" title={item.name}>
                        {item.name}
                    </span>
                </div>
              </TableCell>
              <TableCell className="text-right pr-2 py-3">
                <div className="flex flex-col gap-1.5 items-end">
                    <span className="font-bold text-white text-sm tabular-nums">{formatMoney(item.total)}</span>
                    <Progress value={(item.total / maxTotal) * 100} className="h-1 bg-white/10 w-20" indicatorClassName="bg-emerald-500/80" />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
              <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground text-sm">
                      Nenhum movimento
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

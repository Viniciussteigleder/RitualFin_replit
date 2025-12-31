/**
 * Contextual Detail Panel for Calendar
 *
 * Shows contextual title and content based on selection:
 * - Day selected: "Detalhes do Dia" + transaction list
 * - Week selected: "Resumo da Semana" + summary + transactions
 *
 * Each transaction shows:
 * - Merchant icon + name
 * - Category subtitle
 * - Icon badges (fixed/variable, recurring, refund, internal)
 * - Account icon
 * - Amount (red/green)
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { getMerchantIcon } from "@/lib/merchant-icons";
import { getAccountIcon, IconBadge, TRANSACTION_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { merchantMetadataApi } from "@/lib/api";
import { resolveMerchantMetadata } from "@/lib/merchant-metadata";

interface Transaction {
  id: string;
  paymentDate: string;
  amount: number;
  type: string;
  descRaw: string;
  category1?: string;
  category2?: string;
  category3?: string;
  fixVar?: string;
  recurring?: boolean;
  isRefund?: boolean;
  internalTransfer?: boolean;
  projected?: boolean;
  accountSource?: string;
}

interface DetailPanelProps {
  mode: "day" | "week" | null;
  selectedDate: Date | null;
  transactions: Transaction[];
}

export function DetailPanel({ mode, selectedDate, transactions }: DetailPanelProps) {
  const { data: merchantMetadata = [] } = useQuery({
    queryKey: ["merchant-metadata"],
    queryFn: merchantMetadataApi.list,
  });

  if (!mode || !selectedDate) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Selecione um dia ou semana para ver detalhes
          </p>
        </CardContent>
      </Card>
    );
  }

  const title = mode === "day" ? "Detalhes do Dia" : "Resumo da Semana";

  // Filter transactions based on mode
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.paymentDate);
    if (mode === "day") {
      return isSameDay(tDate, selectedDate);
    } else {
      // Week mode
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1, locale: ptBR });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1, locale: ptBR });
      return tDate >= weekStart && tDate <= weekEnd;
    }
  });

  // Calculate summary
  const summary = {
    income: filteredTransactions
      .filter((t) => t.type === "Receita" && !t.internalTransfer)
      .reduce((sum, t) => sum + t.amount, 0),
    expense: Math.abs(
      filteredTransactions
        .filter((t) => t.type === "Despesa" && !t.internalTransfer)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    ),
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {mode === "day"
            ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
            : `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd", { locale: ptBR })} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {summary.income.toLocaleString("pt-BR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <p className="text-lg font-bold text-rose-600">
              {summary.expense.toLocaleString("pt-BR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma transação neste período
            </p>
          ) : (
            filteredTransactions.map((t) => {
              const metadataOverride = resolveMerchantMetadata(merchantMetadata, t.descRaw);
              const merchantInfo = metadataOverride || getMerchantIcon(t.descRaw);
              const accountInfo = getAccountIcon(t.accountSource);
              const merchantLabel =
                metadataOverride?.friendlyName ||
                t.descRaw?.split(" -- ")[0]?.replace(/\s+\d{4,}/g, "");

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Merchant Icon */}
                    {merchantInfo && (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${merchantInfo.color}15` }}
                      >
                        <merchantInfo.icon
                          className="w-5 h-5"
                          style={{ color: merchantInfo.color }}
                        />
                      </div>
                    )}

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      {/* Merchant + Badges */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-sm truncate">
                          {merchantLabel}
                        </p>
                        {/* Icon badges */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {t.fixVar === "Fixo" && (
                            <IconBadge {...TRANSACTION_ICONS.fixed} size="xs" />
                          )}
                          {t.recurring && (
                            <IconBadge {...TRANSACTION_ICONS.recurring} size="xs" />
                          )}
                          {t.isRefund && (
                            <IconBadge {...TRANSACTION_ICONS.refund} size="xs" />
                          )}
                          {t.internalTransfer && (
                            <IconBadge {...TRANSACTION_ICONS.internal} size="xs" />
                          )}
                          {t.projected && (
                            <span className="text-[9px] px-1 py-0.5 rounded-full border border-dashed border-amber-400 text-amber-700">
                              Projetado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Category Subtitle */}
                      {t.category1 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[t.category1, t.category2, t.category3]
                            .filter(Boolean)
                            .join(" → ")}
                        </p>
                      )}

                      {/* Account + Amount */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <IconBadge {...accountInfo} size="xs" />
                          <span className="text-xs text-muted-foreground">
                            {accountInfo.label}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            t.amount > 0 ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {t.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

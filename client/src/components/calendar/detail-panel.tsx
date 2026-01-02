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
import { isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { AliasLogo } from "@/components/alias-logo";
import { getAccountIcon, getTransactionIcons, IconBadge } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { calendarDetailCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface Transaction {
  id: string;
  paymentDate: string;
  amount: number;
  type: string;
  descRaw: string;
  simpleDesc?: string;
  aliasDesc?: string;
  logoLocalPath?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  fixVar?: string;
  recurring?: boolean;
  recurringFlag?: boolean;
  isRefund?: boolean;
  internalTransfer?: boolean;
  accountSource?: string;
}

interface DetailPanelProps {
  mode: "day" | "week" | null;
  selectedDate: Date | null;
  transactions: Transaction[];
}

export function DetailPanel({ mode, selectedDate, transactions }: DetailPanelProps) {
  const locale = useLocale();
  const transactionIcons = getTransactionIcons(locale);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit" });
  const dayMonthFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
  if (!mode || !selectedDate) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {translate(locale, calendarDetailCopy.emptyPrompt)}
          </p>
        </CardContent>
      </Card>
    );
  }

  const title = mode === "day"
    ? translate(locale, calendarDetailCopy.titleDay)
    : translate(locale, calendarDetailCopy.titleWeek);

  // Filter transactions based on mode
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.paymentDate);
    if (mode === "day") {
      return isSameDay(tDate, selectedDate);
    } else {
      // Week mode
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
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
            ? dateFormatter.format(selectedDate)
            : `${dayFormatter.format(startOfWeek(selectedDate, { weekStartsOn: 1 }))} - ${dayMonthFormatter.format(endOfWeek(selectedDate, { weekStartsOn: 1 }))}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">{translate(locale, calendarDetailCopy.income)}</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {currencyFormatter.format(summary.income)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs text-muted-foreground">{translate(locale, calendarDetailCopy.expense)}</span>
            </div>
            <p className="text-lg font-bold text-rose-600">
              {currencyFormatter.format(summary.expense)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {translate(locale, calendarDetailCopy.emptyList)}
            </p>
          ) : (
            filteredTransactions.map((t) => {
              const fallbackDesc = t.simpleDesc || t.descRaw?.split(" -- ")[0]?.replace(/\s+\d{4,}/g, "");
              const accountInfo = getAccountIcon(t.accountSource, locale);

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Merchant Icon */}
                    <AliasLogo
                      aliasDesc={t.aliasDesc}
                      fallbackDesc={fallbackDesc}
                      logoUrl={t.logoLocalPath}
                      size={24}
                      showText={false}
                    />

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      {/* Merchant + Badges */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-sm truncate">
                          {t.aliasDesc || fallbackDesc}
                        </p>
                        {/* Icon badges */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {t.fixVar === "Fixo" && (
                            <IconBadge {...transactionIcons.fixed} size="xs" />
                          )}
                          {(t.recurringFlag || t.recurring) && (
                            <IconBadge {...transactionIcons.recurring} size="xs" />
                          )}
                          {t.isRefund && (
                            <IconBadge {...transactionIcons.refund} size="xs" />
                          )}
                          {t.internalTransfer && (
                            <IconBadge {...transactionIcons.internal} size="xs" />
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
                          {currencyFormatter.format(t.amount)}
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

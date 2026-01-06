/**
 * Week Blocks View for Calendar
 *
 * Displays the month as 4-5 selectable week blocks (not 7-day week view)
 * Each block shows total income (green) and expense (red)
 * Future weeks show projected commitments + available-to-spend
 */

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isSameWeek,
  isAfter,
} from "date-fns";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { calendarWeekCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface Transaction {
  id: string;
  paymentDate: string;
  amount: number;
  type: string;
  internalTransfer?: boolean;
}

interface WeekBlocksViewProps {
  month: string; // YYYY-MM format
  transactions: Transaction[];
  selectedWeek: Date | null;
  onWeekSelect: (week: Date) => void;
}

export function WeekBlocksView({ month, transactions, selectedWeek, onWeekSelect }: WeekBlocksViewProps) {
  const locale = useLocale();
  const [year, monthNum] = month.split("-").map(Number);
  const monthDate = new Date(year, monthNum - 1, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  // Get weeks of the month
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  const today = new Date();
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit" });
  const dayMonthFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  // Calculate totals for a week
  const getWeekTotals = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const weekTransactions = transactions.filter((t) => {
      const tDate = new Date(t.paymentDate);
      return (
        !t.internalTransfer &&
        tDate >= weekStart &&
        tDate <= weekEnd
      );
    });

    const income = weekTransactions
      .filter((t) => t.type === "Receita")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = Math.abs(
      weekTransactions
        .filter((t) => t.type === "Despesa")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    );

    return { income, expense, net: income - expense };
  };

  const isFutureWeek = (weekStart: Date) => {
    return isAfter(weekStart, today);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {weeks.map((weekStart, idx) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const totals = getWeekTotals(weekStart);
        const isSelected = selectedWeek && isSameWeek(weekStart, selectedWeek, { weekStartsOn: 1 });
        const isFuture = isFutureWeek(weekStart);

        return (
          <Card
            key={idx}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
              isSelected && "ring-2 ring-primary shadow-lg",
              isFuture && "bg-muted/30"
            )}
            onClick={() => onWeekSelect(weekStart)}
          >
            <div className="p-4 space-y-3">
              {/* Week Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    {formatMessage(translate(locale, calendarWeekCopy.weekLabel), { index: idx + 1 })}
                  </span>
                </div>
                {isFuture && (
                  <span className="text-xs text-muted-foreground bg-amber-100 px-2 py-0.5 rounded-full">
                    {translate(locale, calendarWeekCopy.projected)}
                  </span>
                )}
              </div>

              {/* Date Range */}
              <p className="text-xs text-muted-foreground">
                {dayFormatter.format(weekStart)} - {dayMonthFormatter.format(weekEnd)}
              </p>

              {/* Income/Expense Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-muted-foreground">{translate(locale, calendarWeekCopy.income)}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {currencyFormatter.format(totals.income)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                    <span className="text-xs text-muted-foreground">{translate(locale, calendarWeekCopy.expense)}</span>
                  </div>
                  <span className="text-sm font-bold text-rose-600">
                    {currencyFormatter.format(totals.expense)}
                  </span>
                </div>
              </div>

              {/* Net */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{translate(locale, calendarWeekCopy.balance)}</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      totals.net >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {currencyFormatter.format(totals.net)}
                  </span>
                </div>
              </div>

              {/* Future Week: Available to Spend (placeholder for now) */}
              {isFuture && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-amber-600 font-medium">
                    💡 {translate(locale, calendarWeekCopy.capacityNote)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

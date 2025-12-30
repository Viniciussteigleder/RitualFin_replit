/**
 * Month Calendar View
 *
 * Each day cell shows:
 * - Income total (green chip)
 * - Expense total (red chip)
 * - Internal transactions excluded from totals
 * - Future days show projected items with distinct styling
 */

import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  format,
  isAfter,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  paymentDate: string;
  amount: number;
  type: string;
  internalTransfer?: boolean;
  projected?: boolean;
}

interface MonthViewProps {
  month: string; // YYYY-MM format
  transactions: Transaction[];
  selectedDay: Date | null;
  onDaySelect: (day: Date) => void;
}

export function MonthView({ month, transactions, selectedDay, onDaySelect }: MonthViewProps) {
  const [year, monthNum] = month.split("-").map(Number);
  const monthDate = new Date(year, monthNum - 1, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  // Get calendar grid (includes days from prev/next month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1, locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1, locale: ptBR });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const today = new Date();

  // Calculate totals for a day
  const getDayTotals = (day: Date) => {
    const dayTransactions = transactions.filter(
      (t) => !t.internalTransfer && isSameDay(new Date(t.paymentDate), day)
    );

    const income = dayTransactions
      .filter((t) => t.type === "Receita")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = Math.abs(
      dayTransactions
        .filter((t) => t.type === "Despesa")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    );

    const hasProjected = dayTransactions.some((t) => t.projected);

    return { income, expense, hasProjected };
  };

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const totals = getDayTotals(day);
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isTodayDate = isToday(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isFuture = isAfter(day, today);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] p-2 border-r border-b cursor-pointer transition-all hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isSelected && "bg-primary/10 ring-2 ring-inset ring-primary",
                isTodayDate && "ring-2 ring-inset ring-blue-500"
              )}
              onClick={() => onDaySelect(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isTodayDate && "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  )}
                >
                  {format(day, "d")}
                </span>
                {isFuture && totals.hasProjected && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    Proj
                  </span>
                )}
              </div>

              {/* Income/Expense chips */}
              <div className="space-y-1">
                {totals.income > 0 && (
                  <div
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      isFuture && totals.hasProjected
                        ? "bg-emerald-100 text-emerald-700 border border-dashed border-emerald-300"
                        : "bg-emerald-500 text-white"
                    )}
                  >
                    +{totals.income.toFixed(0)}
                  </div>
                )}
                {totals.expense > 0 && (
                  <div
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                      isFuture && totals.hasProjected
                        ? "bg-rose-100 text-rose-700 border border-dashed border-rose-300"
                        : "bg-rose-500 text-white"
                    )}
                  >
                    -{totals.expense.toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

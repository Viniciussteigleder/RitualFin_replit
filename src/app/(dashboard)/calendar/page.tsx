import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarNav } from "./calendar-nav";
import { cn } from "@/lib/utils";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Please log in to view calendar</div>;
  }

  // Parse month from search params or use current month
  const currentDate = searchParams.month
    ? new Date(searchParams.month + "-01")
    : new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Fetch transactions for the month
  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      gte(transactions.paymentDate, firstDay),
      lte(transactions.paymentDate, lastDay)
    ),
  });

  // Group transactions by day
  const transactionsByDay = monthTransactions.reduce((acc, tx) => {
    const day = new Date(tx.paymentDate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {} as Record<number, typeof monthTransactions>);

  // Calendar grid calculation
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill initial empty days
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Fill days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Calendar"
        description="Visualize your recurring payments and upcoming bills."
        breadcrumbs={[{ label: "Overview" }, { label: "Calendar" }]}
      >
        <CalendarNav
          currentDate={currentDate}
          prevMonthStr={prevMonthStr}
          nextMonthStr={nextMonthStr}
        />
      </PageHeader>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest p-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dayTransactions = day ? transactionsByDay[day] || [] : [];
                const totalAmount = dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "min-h-[100px] p-2 border rounded-lg transition-all",
                      day ? "bg-white hover:bg-slate-50 cursor-pointer" : "bg-slate-50/50",
                      isToday && "ring-2 ring-indigo-600 bg-indigo-50/50"
                    )}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isToday ? "text-indigo-600" : "text-slate-900"
                            )}
                          >
                            {day}
                          </span>
                          {dayTransactions.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {dayTransactions.length}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayTransactions.slice(0, 2).map((tx) => (
                            <div
                              key={tx.id}
                              className="text-[10px] truncate p-1 bg-slate-100 rounded"
                            >
                              <div className="font-medium text-slate-900 truncate">
                                {tx.descNorm}
                              </div>
                              <div
                                className={cn(
                                  "font-bold font-mono",
                                  tx.amount < 0 ? "text-rose-600" : "text-emerald-600"
                                )}
                              >
                                {new Intl.NumberFormat("de-DE", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(tx.amount)}
                              </div>
                            </div>
                          ))}
                          {dayTransactions.length > 2 && (
                            <div className="text-[10px] text-slate-500 font-medium text-center">
                              +{dayTransactions.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-600" />
              <span className="text-slate-600">Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-600">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full ring-2 ring-indigo-600" />
              <span className="text-slate-600">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

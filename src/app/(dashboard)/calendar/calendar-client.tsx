"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Circle,
  TrendingDown,
  TrendingUp,
  X
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface CalendarClientProps {
  currentDate: Date;
  transactionsByDay: Record<number, any[]>;
  eventsByDay: Record<number, any[]>;
  weeks: (number | null)[][];
  monthName: string;
}

export function CalendarClient({ 
    currentDate, 
    transactionsByDay, 
    eventsByDay, 
    weeks, 
    monthName 
}: CalendarClientProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDay(new Date().getDate());
  }, []);

  const selectedTransactions = selectedDay ? transactionsByDay[selectedDay] || [] : [];
  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];
  
  // Calculations for selected day
  const dayExpense = selectedTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const dayIncome = selectedTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full items-start">
        {/* Main Grid */}
        <Card className="lg:col-span-3 rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 h-[700px]">
              {weeks.map((week, wIndex) =>
                week.map((day, dIndex) => {
                  const dayTx = day ? transactionsByDay[day] || [] : [];
                  const dayEvents = day ? eventsByDay[day] || [] : [];
                  const isToday = day === (typeof window !== "undefined" ? new Date().getDate() : null) &&
                                   currentDate.getMonth() === new Date().getMonth() &&
                                   currentDate.getFullYear() === new Date().getFullYear();
                  
                  const isSelected = day === selectedDay;
                  
                  // Daily Sums
                  const dailyExpenseSum = dayTx.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
                  const dailyIncomeSum = dayTx.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);

                  return (
                    <div
                      key={`${wIndex}-${dIndex}`}
                      className={cn(
                        "p-2 border-r border-b border-border last:border-r-0 transition-all group/day cursor-pointer min-h-[120px] relative flex flex-col justify-between",
                        !day && "bg-secondary/10 pointer-events-none",
                        day && "hover:bg-primary/5",
                        isSelected && "bg-primary/5 ring-inset ring-2 ring-primary/20"
                      )}
                      onClick={() => day && setSelectedDay(day)}
                    >
                      {day && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
                              isToday ? "bg-primary text-white" : "text-foreground group-hover/day:text-primary",
                              isSelected && !isToday && "bg-primary/20 text-primary"
                            )}>
                              {day}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-auto">
                            {/* Past Data: Income / Expense Sums */}
                            {(dailyIncomeSum > 0 || dailyExpenseSum > 0) && (
                                <div className="flex flex-col gap-1">
                                    {dailyIncomeSum > 0 && (
                                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md flex justify-between">
                                            <span>Entrada</span>
                                            <span>{formatCurrency(dailyIncomeSum)}</span>
                                        </div>
                                    )}
                                    {dailyExpenseSum > 0 && (
                                        <div className="text-[10px] font-bold text-red-600 bg-red-100/50 px-2 py-0.5 rounded-md flex justify-between">
                                            <span>Saída</span>
                                            <span>{formatCurrency(dailyExpenseSum)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Future/Projected Events */}
                            {dayEvents.length > 0 && (
                                <div className="flex flex-col gap-1 border-t border-dashed border-border pt-1 mt-1">
                                    {dayEvents.map(ev => (
                                        <div key={ev.id} className="text-[9px] font-medium text-blue-600 flex items-center gap-1">
                                            <Circle className="w-1.5 h-1.5 fill-current" />
                                            <span className="truncate">{ev.name}</span>
                                        </div>
                                    ))}
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

        {/* Events Side Panel - Dynamic */}
        <div className="flex flex-col gap-6 h-full">
          <Card className="rounded-[2.5rem] border-border shadow-sm bg-card flex-1 flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Detalhes do Dia</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        {selectedDay ? `${selectedDay} de ${monthName}` : "Selecione um dia"}
                    </p>
                </div>
                {selectedDay && (
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
              </div>
              
              {!selectedDay ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <CalendarIcon className="h-12 w-12 mb-4" />
                      <p className="font-bold">Selecione um dia no calendário</p>
                  </div>
              ) : (
                  <div className="flex flex-col gap-6 overflow-y-auto pr-2 max-h-[600px]">
                      {/* Summary for Day */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-500/10 p-4 rounded-2xl">
                              <span className="text-[10px] font-black uppercase text-emerald-600">Entradas</span>
                              <p className="text-lg font-bold text-emerald-600">{formatCurrency(dayIncome)}</p>
                          </div>
                          <div className="bg-red-500/10 p-4 rounded-2xl">
                              <span className="text-[10px] font-black uppercase text-red-600">Saídas</span>
                              <p className="text-lg font-bold text-red-600">{formatCurrency(dayExpense)}</p>
                          </div>
                      </div>

                      {/* Transactions List */}
                      {selectedTransactions.length > 0 && (
                          <div className="space-y-3">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Transações Realizadas</h4>
                              {selectedTransactions.map(tx => (
                                  <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-transparent hover:border-border transition-all">
                                      <div className="flex flex-col overflow-hidden">
                                          <span className="text-sm font-bold truncate">{tx.descNorm || tx.descRaw}</span>
                                          <span className="text-[10px] text-muted-foreground">{tx.category1}</span>
                                      </div>
                                      <span className={cn("text-xs font-bold", tx.amount < 0 ? "text-red-500" : "text-emerald-500")}>
                                          {formatCurrency(tx.amount)}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Events List */}
                      {selectedEvents.length > 0 && (
                          <div className="space-y-3">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Eventos Projetados</h4>
                              {selectedEvents.map(ev => (
                                  <div key={ev.id} className="flex items-center justify-between p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                      <div className="flex flex-col">
                                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{ev.name}</span>
                                          <span className="text-[10px] text-blue-500">Recorrente</span>
                                      </div>
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                          {formatCurrency(ev.amount)}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      )}

                      {selectedTransactions.length === 0 && selectedEvents.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-10 italic">Nada consta para este dia.</p>
                      )}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

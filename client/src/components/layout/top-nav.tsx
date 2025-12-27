import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, Bell, User, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import { useMonth } from "@/lib/month-context";

const NAV_TABS = [
  { label: "Painel", href: "/dashboard" },
  { label: "Transacoes", href: "/confirm" },
  { label: "Orcamento", href: "/rules" },
];

export function TopNav() {
  const [location] = useLocation();
  const { month, setMonth, formatMonth } = useMonth();

  const { data: confirmQueue = [] } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const pendingCount = confirmQueue.length;

  const prevMonth = () => {
    const [year, m] = month.split("-").map(Number);
    const newDate = new Date(year, m - 2, 1);
    setMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`);
  };

  const nextMonth = () => {
    const [year, m] = month.split("-").map(Number);
    const newDate = new Date(year, m, 1);
    setMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-semibold text-lg text-foreground hidden sm:inline">RitualFin</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = location === tab.href || (tab.href === "/dashboard" && location === "/");
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors relative",
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tab.label}
                    {tab.href === "/confirm" && pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{formatMonth(month)}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Link href="/uploads">
              <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload CSV</span>
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

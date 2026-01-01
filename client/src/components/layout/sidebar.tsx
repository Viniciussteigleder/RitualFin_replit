import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Target,
  Wallet,
  Receipt,
  Bell
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMonth } from "@/lib/month-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_CLUSTERS = [
  {
    label: "Visão Geral",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        description: "Visão geral do mês"
      },
      {
        label: "Calendário",
        icon: Calendar,
        href: "/calendar",
        description: "Eventos e compromissos"
      },
      {
        label: "Notificações",
        icon: Bell,
        href: "/notifications",
        description: "Alertas e mensagens"
      },
    ]
  },
  {
    label: "Planejamento",
    items: [
      {
        label: "Orçamentos",
        icon: Wallet,
        href: "/budgets",
        description: "Limites por categoria"
      },
      {
        label: "Metas",
        icon: Target,
        href: "/goals",
        description: "Planejamento financeiro"
      },
    ]
  },
  {
    label: "Ações",
    items: [
      {
        label: "Transações",
        icon: Receipt,
        href: "/transactions",
        description: "Histórico completo"
      },
    ]
  },
  {
    label: "Operações",
    items: [
      {
        label: "Uploads",
        icon: Upload,
        href: "/uploads",
        description: "Importar CSV"
      },
      {
        label: "Contas",
        icon: Wallet,
        href: "/accounts",
        description: "Gerenciar cartões e contas"
      },
    ]
  },
  {
    label: "Colaboração",
    items: [
      {
        label: "Rituais",
        icon: Sparkles,
        href: "/rituals",
        description: "Revisão semanal e mensal"
      },
    ]
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Configurações",
        icon: Settings,
        href: "/settings",
        description: "Preferências e integrações"
      },
    ]
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { month, setMonth, formatMonth } = useMonth();

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
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-sm border-b z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/ritualfin-logo.png" 
              alt="RitualFin" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold text-lg tracking-tight">RitualFin</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium min-w-[80px] text-center">{formatMonth(month)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 bg-slate-900 transition-all duration-300 flex flex-col h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-[72px]" : "w-64"
      )}>
        <div className={cn(
          "h-16 flex items-center border-b border-white/10",
          isCollapsed ? "px-4 justify-center" : "px-5"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <img 
              src="/ritualfin-logo.png" 
              alt="RitualFin" 
              className="w-9 h-9 rounded-xl shadow-lg"
            />
            {!isCollapsed && (
              <span className="font-bold text-lg text-white tracking-tight">RitualFin</span>
            )}
          </Link>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Período</span>
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10" 
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center text-sm font-semibold text-white">
                  {formatMonth(month)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10" 
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {NAV_CLUSTERS.map((cluster, clusterIdx) => (
            <div key={cluster.label} className={clusterIdx > 0 ? "mt-6" : ""}>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                    {cluster.label}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {cluster.items.map((item) => {
                  const isActive = location === item.href;

                  const NavLink = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
                      )} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                        </>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return NavLink;
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          {isCollapsed ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-colors",
                      location === "/settings"
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Configurações</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/login"
                    className="flex items-center justify-center p-2.5 rounded-xl text-sm font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  location === "/settings"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
                data-testid="nav-settings"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                data-testid="nav-logout"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/10 rounded-full items-center justify-center text-white/60 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}

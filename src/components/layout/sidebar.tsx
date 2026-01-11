"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  CreditCard,
  Settings,
  LogOut,
  CalendarDays,
  Menu,
  X,
  Sparkles,
  Wallet,
  TrendingUp,
  RefreshCw,
  Bot,
  BarChart3,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { layoutCopy, t as translate } from "@/lib/i18n";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const sidebarLabels = useMemo(() => translate(locale, layoutCopy.sidebar), [locale]);

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, href: "/", label: "Dashboard" },
    { id: "analytics", icon: BarChart3, href: "/analytics", label: "Análise" },
    { id: "transactions", icon: Receipt, href: "/transactions", label: "Transações" },
    { id: "confirm", icon: Sparkles, href: "/confirm", label: "Revisar" },
    { id: "calendar", icon: CalendarDays, href: "/calendar", label: "Calendário" },
    { id: "rituals", icon: RefreshCw, href: "/rituals", label: "Rituais" },
    { id: "goals", icon: Target, href: "/goals", label: "Metas" },
    { id: "budgets", icon: PieChart, href: "/budgets", label: "Orçamentos" },
    { id: "accounts", icon: Wallet, href: "/accounts", label: "Contas" },
    { id: "uploads", icon: Receipt, href: "/admin/import", label: "Importar" },
    { id: "ai-rules", icon: Bot, href: "/admin/rules", label: "Regras IA" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5">
             <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-foreground font-display">RitualFin</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)} 
          className="dark:text-white focus-ring"
          aria-label={isOpen ? sidebarLabels.closeMenu : sidebarLabels.openMenu}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 h-screen bg-sidebar border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0 w-72 p-6 flex flex-col justify-between",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-xl font-bold tracking-tight font-display">RitualFin</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
            {/* CORE SECTION */}
            <div className="flex flex-col gap-1">
              <p className="px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Monitoramento</p>
              {[
                { id: "dashboard", icon: LayoutDashboard, href: "/", label: "Dashboard" },
                { id: "analytics", icon: BarChart3, href: "/analytics", label: "Análise Total" },
                { id: "transactions", icon: Receipt, href: "/transactions", label: "Extrato" },
                { id: "confirm", icon: Sparkles, href: "/confirm", label: "Sugestões IA", badge: "Ação" },
              ].map((item) => {
                const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/');
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all group focus-ring",
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 border border-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                      )} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* STRATEGY SECTION */}
            <div className="flex flex-col gap-1">
              <p className="px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Planejamento</p>
              {[
                { id: "calendar", icon: CalendarDays, href: "/calendar", label: "Calendário" },
                { id: "rituals", icon: RefreshCw, href: "/rituals", label: "Meus Rituais" },
                { id: "goals", icon: Target, href: "/goals", label: "Metas" },
                { id: "budgets", icon: PieChart, href: "/budgets", label: "Orçamentos" },
                { id: "accounts", icon: Wallet, href: "/accounts", label: "Contas" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group focus-ring",
                      isActive
                        ? "bg-secondary text-foreground font-bold border border-border"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground"
                    )} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ADMIN SECTION (TUCKED AWAY) */}
            <div className="flex flex-col gap-1">
              <p className="px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Configurações</p>
              {[
                { id: "uploads", icon: Receipt, href: "/uploads", label: "Importar Arquivos" },
                { id: "ai-rules", icon: Bot, href: "/settings/rules", label: "Regras de IA" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group opacity-70 hover:opacity-100 focus-ring",
                      isActive
                        ? "bg-secondary text-foreground font-bold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground"
                    )} />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1 pt-6 border-t border-border">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-secondary hover:text-foreground font-medium group text-sm focus-ring",
              pathname === "/settings" && "bg-secondary text-foreground font-bold"
            )}
            aria-current={pathname === "/settings" ? "page" : undefined}
          >
            <Settings className="h-5 w-5 text-muted-foreground/60 group-hover:text-foreground group-hover:rotate-45 transition-transform" />
            <span>{sidebarLabels.items.settings}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-medium group text-sm w-full text-left focus-ring"
            aria-label={sidebarLabels.items.logout}
          >
            <LogOut className="h-5 w-5 text-muted-foreground/60 group-hover:text-destructive group-hover:-translate-x-1 transition-transform" />
            <span>{sidebarLabels.items.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

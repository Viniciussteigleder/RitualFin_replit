"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  Settings,
  LogOut,
  CalendarDays,
  Menu,
  X,
  Sparkles,
  Wallet,
  RefreshCw,
  Bot,
  BarChart3,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { layoutCopy, t as translate } from "@/lib/i18n";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Group States (Default Open)
  const [coreOpen, setCoreOpen] = useState(true);
  const [strategyOpen, setStrategyOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const locale = useLocale();
  const sidebarLabels = useMemo(() => translate(locale, layoutCopy.sidebar), [locale]);

  // Helper for Link Items
  const SidebarItem = ({ item, isChild = false }: { item: any, isChild?: boolean }) => {
    const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/');
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
            "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group focus-ring relative overflow-hidden",
            isActive
            ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 border border-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium",
            isChild && "ml-2"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="flex items-center gap-3 relative z-10">
          <item.icon className={cn(
            "h-5 w-5 transition-transform group-hover:scale-110",
            isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
          )} />
          <span className="text-sm">{item.label}</span>
        </div>
        {item.badge && (
          <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter relative z-10">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

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
        <div className="flex flex-col gap-8 h-full min-h-0">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 flex-shrink-0">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden relative">
              <Image 
                src="/logo-ritualfin-wax-seal.png" 
                alt="RitualFin Logo" 
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-xl font-bold tracking-tight font-display">RitualFin</h1>
            </div>
          </div>

          {/* Navigation - Scrollable Area */}
          <nav className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
            
            {/* CORE SECTION */}
            <Collapsible open={coreOpen} onOpenChange={setCoreOpen} className="space-y-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] hover:text-foreground transition-colors mb-2">
                    Monitoramento
                    {coreOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                    {[
                        { id: "dashboard", icon: LayoutDashboard, href: "/", label: "Dashboard" },
                        { id: "analytics", icon: BarChart3, href: "/analytics", label: "Análise Total" },
                        { id: "transactions", icon: Receipt, href: "/transactions", label: "Extrato" },
                        { id: "confirm", icon: Sparkles, href: "/confirm", label: "Sugestões IA", badge: "Ação" },
                    ].map(item => <SidebarItem key={item.id} item={item} />)}
                </CollapsibleContent>
            </Collapsible>

            {/* STRATEGY SECTION */}
            <Collapsible open={strategyOpen} onOpenChange={setStrategyOpen} className="space-y-1 pt-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] hover:text-foreground transition-colors mb-2">
                    Planejamento
                    {strategyOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                    {[
                        { id: "calendar", icon: CalendarDays, href: "/calendar", label: "Calendário" },
                        { id: "rituals", icon: RefreshCw, href: "/rituals", label: "Meus Rituais" },
                        { id: "goals", icon: Target, href: "/goals", label: "Metas" },
                        { id: "budgets", icon: PieChart, href: "/budgets", label: "Orçamentos" },
                        { id: "accounts", icon: Wallet, href: "/accounts", label: "Contas" },
                    ].map(item => <SidebarItem key={item.id} item={item} />)}
                </CollapsibleContent>
            </Collapsible>

            {/* ADMIN SECTION */}
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="space-y-1 pt-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.2em] hover:text-foreground transition-colors mb-2">
                    Configurações
                    {adminOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                    {[
                        { id: "uploads", icon: Receipt, href: "/uploads", label: "Importar Arquivos" },
                        { id: "ai-rules", icon: Bot, href: "/settings/rules", label: "Regras de IA" },
                    ].map(item => <SidebarItem key={item.id} item={item} />)}
                </CollapsibleContent>
            </Collapsible>
          </nav>

          {/* Footer - Fixed at Bottom of Flex Container */}
          <div className="flex flex-col gap-1 pt-6 border-t border-border flex-shrink-0">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-secondary hover:text-foreground font-medium group text-sm focus-ring",
                pathname === "/settings" && "bg-secondary text-foreground font-bold"
              )}
            >
              <Settings className="h-5 w-5 text-muted-foreground/60 group-hover:text-foreground group-hover:rotate-45 transition-transform" />
              <span>{sidebarLabels.items.settings}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-medium group text-sm w-full text-left focus-ring"
            >
              <LogOut className="h-5 w-5 text-muted-foreground/60 group-hover:text-destructive group-hover:-translate-x-1 transition-transform" />
              <span>{sidebarLabels.items.logout}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

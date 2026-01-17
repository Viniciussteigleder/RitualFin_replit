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
  ChevronRight,
  Activity,
  Compass,
  Cog,
  LucideIcon,
  ListOrdered
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { layoutCopy, t as translate } from "@/lib/i18n";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Image from "next/image";
import { AppIcon } from "@/components/ui/app-icon";

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  href: string;
  label: string;
  badge?: string;
  children?: SidebarItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Group States (Default Open)
  const [coreOpen, setCoreOpen] = useState(true);
  const [strategyOpen, setStrategyOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const locale = useLocale();
  const sidebarLabels = useMemo(() => translate(locale, layoutCopy.sidebar), [locale]);

  const iconColorById: Record<string, string> = {
    "dashboard": "#059669", // Primary green (Emerald 600)
    "transactions": "#6366F1", // Indigo
    "goals": "#10B981", // Emerald
    "analytics": "#8B5CF6", // Violet
    "agenda": "#F59E0B", // Amber
    "rituals": "#EC4899", // Pink
    "budgets": "#3B82F6", // Blue
    "accounts": "#64748B", // Slate
    "rules": "#14B8A6", // Teal
    "uploads": "#94A3B8", // Slate
    "settings": "#64748B", // Slate
    "ai-rules": "#8B5CF6", // Violet (AI)
    "calendar": "#F59E0B", // Amber
  };

  // Helper for Link Items
  const renderNavItem = (item: SidebarItem, isChild = false) => {
    const isActive = pathname === item.href || (item.children?.some((child: SidebarItem) => pathname === child.href) ?? false);
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
            "flex items-center justify-between px-3 py-2 rounded-xl transition-all group focus-ring relative overflow-hidden",
            isActive
            ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 border border-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium",
            isChild && "ml-2"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="flex items-center gap-3 relative z-10">
          <AppIcon
            icon={item.icon}
            color={iconColorById[item.id]}
            selected={isActive}
            variant="gradient"
            className={cn("transition-transform group-hover:scale-[1.05]", "w-8 h-8 rounded-lg shadow-sm")} // 32px box
            iconClassName="w-4 h-4" // 16px icon
          />
          <span className="text-[14px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
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
	            <div className="h-12 w-12 rounded-2xl bg-transparent border border-border/50 flex items-center justify-center overflow-hidden relative shadow-sm">
	              <Image 
	                src="/RitualFin%20Logo.png" 
	                alt="RitualFin Logo" 
	                fill
	                sizes="48px"
	                className="object-contain p-1"
	                priority
	              />
	            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-xl font-bold tracking-tight font-display">RitualFin</h1>
            </div>
          </div>

          {/* Navigation - Scrollable Area */}
          <nav className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">

            {/* CORE SECTION - Monitoramento */}
            <Collapsible open={coreOpen} onOpenChange={setCoreOpen}>
                <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-foreground tracking-wide">Monitoramento</span>
                      </div>
                      {coreOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pt-3">
                      {[
                          { id: "dashboard", icon: LayoutDashboard, href: "/", label: "Dashboard" },
                          { id: "analytics", icon: BarChart3, href: "/analytics", label: "Análise Total" },
                          { id: "transactions", icon: Receipt, href: "/transactions", label: "Extrato" },
                          { id: "confirm", icon: Sparkles, href: "/confirm", label: "Sugestões IA", badge: "Ação" },
                      ].map(item => renderNavItem(item, false))}
                  </CollapsibleContent>
                </div>
            </Collapsible>

            {/* STRATEGY SECTION - Planejamento */}
            <Collapsible open={strategyOpen} onOpenChange={setStrategyOpen}>
                <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                          <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-foreground tracking-wide">Planejamento</span>
                      </div>
                      {strategyOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pt-3">
                      {[
                          { id: "agenda", icon: ListOrdered, href: "/agenda", label: "Agenda" },
                          { id: "calendar", icon: CalendarDays, href: "/calendar", label: "Calendário" },
                          { id: "rituals", icon: RefreshCw, href: "/rituals", label: "Meus Rituais" },
                          { id: "goals", icon: Target, href: "/goals", label: "Metas" },
                          { id: "budgets", icon: PieChart, href: "/budgets", label: "Orçamentos" },
                          { id: "accounts", icon: Wallet, href: "/accounts", label: "Contas" },
                      ].map(item => renderNavItem(item, false))}
                  </CollapsibleContent>
                </div>
            </Collapsible>

            {/* ADMIN SECTION - Configurações */}
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-violet-500/10">
                          <Cog className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-xs font-bold text-foreground tracking-wide">Configurações</span>
                      </div>
                      {adminOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pt-3">
                      {[
                          { id: "uploads", icon: Receipt, href: "/uploads", label: "Importar Arquivos" },
                          { id: "ai-rules", icon: Bot, href: "/settings/rules", label: "Regras de IA" },
                      ].map(item => renderNavItem(item, false))}
                  </CollapsibleContent>
                </div>
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

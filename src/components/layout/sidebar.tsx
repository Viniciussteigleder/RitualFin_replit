"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Calendar,
  Target,
  Wallet,
  Receipt,
  Bell,
  Lightbulb,
  ListChecks,
  Filter,
  Brain,
  CalendarCheck,
  TrendingUp
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useMonth } from "@/lib/month-context";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useLocale } from "@/hooks/use-locale";
import { layoutCopy, t as translate } from "@/lib/i18n";

const GROUP_STATE_KEY = "ritualfin_sidebar_groups";

const NAV_CLUSTER_DEFS = [
  {
    id: "overview",
    items: [
      { id: "dashboard", icon: LayoutDashboard, href: "/dashboard", labelKey: "dashboard", descriptionKey: "dashboard" },
      { id: "calendar", icon: Calendar, href: "/calendar", labelKey: "calendar", descriptionKey: "calendar" },
    ]
  },
  {
    id: "action",
    items: [
      { id: "confirm", icon: ListChecks, href: "/confirm", labelKey: "confirm", descriptionKey: "confirm" },
      { id: "transactions", icon: Receipt, href: "/transactions", labelKey: "transactions", descriptionKey: "transactions" },
    ]
  },
  {
    id: "planning",
    items: [
      { id: "budgets", icon: Wallet, href: "/budgets", labelKey: "budgets", descriptionKey: "budgets" },
      { id: "goals", icon: Target, href: "/goals", labelKey: "goals", descriptionKey: "goals" },
    ]
  },
  {
    id: "automation",
    items: [
      { id: "rules", icon: Filter, href: "/rules", labelKey: "rules", descriptionKey: "rules" },
      { id: "ai-keywords", icon: Brain, href: "/ai-keywords", labelKey: "aiKeywords", descriptionKey: "aiKeywords" },
    ]
  },
  {
    id: "operations",
    items: [
      { id: "upload", icon: Upload, href: "/uploads", labelKey: "upload", descriptionKey: "upload" },
      { id: "accounts", icon: Wallet, href: "/accounts", labelKey: "accounts", descriptionKey: "accounts" },
    ]
  },
  {
    id: "collaboration",
    items: [
      { id: "rituals", icon: CalendarCheck, href: "/rituals", labelKey: "rituals", descriptionKey: "rituals" },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const normalizedLocation = pathname?.split("?")[0] || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const locale = useLocale();
  const sidebarLabels = useMemo(() => translate(locale, layoutCopy.sidebar), [locale]);
  
  const formatMessage = (template: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, value), template);

  const [groupOpenState, setGroupOpenState] = useState<Record<string, boolean>>(() => {
    const defaultState = Object.fromEntries(NAV_CLUSTER_DEFS.map((cluster) => [cluster.id, true]));
    // Safety check for SSR
    if (typeof window === "undefined") {
      return defaultState;
    }
    const stored = window.localStorage.getItem(GROUP_STATE_KEY);
    if (!stored) {
      return defaultState;
    }
    try {
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      return Object.fromEntries(
        NAV_CLUSTER_DEFS.map((cluster) => [cluster.id, parsed[cluster.id] ?? true])
      );
    } catch {
      return defaultState;
    }
  });

  const { month, setMonth, formatMonth } = useMonth();

  const navClusters = useMemo(() => {
    return NAV_CLUSTER_DEFS.map((cluster) => ({
      id: cluster.id,
      label: sidebarLabels.groups[cluster.id as keyof typeof sidebarLabels.groups],
      items: cluster.items.map((item) => ({
        ...item,
        label: sidebarLabels.items[item.labelKey as keyof typeof sidebarLabels.items],
        description: sidebarLabels.descriptions[item.descriptionKey as keyof typeof sidebarLabels.descriptions]
      }))
    }));
  }, [sidebarLabels]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(groupOpenState));
  }, [groupOpenState]);

  // Open group if active item is inside it
  useEffect(() => {
    const activeCluster = NAV_CLUSTER_DEFS.find((cluster) =>
      cluster.items.some((item) => normalizedLocation === item.href.split("?")[0])
    );
    if (activeCluster && !groupOpenState[activeCluster.id]) {
      setGroupOpenState((prev) => ({ ...prev, [activeCluster.id]: true }));
    }
  }, [normalizedLocation, groupOpenState]);

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
    <TooltipProvider>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-sm border-b z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
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
            {!isCollapsed && (
              <span className="font-bold text-lg text-white tracking-tight">RitualFin</span>
            )}
          </Link>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                  {sidebarLabels.period}
                </span>
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
          {navClusters.map((cluster, clusterIdx) => (
            <div key={cluster.id} className={clusterIdx > 0 ? "mt-6" : ""}>
              {!isCollapsed && (
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                    {cluster.label}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setGroupOpenState((prev) => ({
                        ...prev,
                        [cluster.id]: !prev[cluster.id]
                      }))
                    }
                    className="text-white/50 hover:text-white transition-colors"
                    aria-label={formatMessage(sidebarLabels.toggleGroup, { group: cluster.label })}
                  >
                    {groupOpenState[cluster.id] ? (
                      <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                    )}
                  </button>
                </div>
              )}
              {groupOpenState[cluster.id] && (
                <div className="space-y-1">
                {cluster.items.map((item) => {
                  const isActive = normalizedLocation === item.href;

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
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                {sidebarLabels.system}
              </span>
            </div>
          )}
          {isCollapsed ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-colors",
                      normalizedLocation === "/settings"
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{sidebarLabels.items.settings}</TooltipContent>
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
                <TooltipContent side="right">{sidebarLabels.items.logout}</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  normalizedLocation === "/settings"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Settings className="h-5 w-5" />
                {sidebarLabels.items.settings}
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {sidebarLabels.items.logout}
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
    </TooltipProvider>
  );
}

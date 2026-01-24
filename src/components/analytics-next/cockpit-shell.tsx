"use client";

import { useState, Suspense } from "react";
import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  ListTree,
  Store,
  RotateCcw,
  Download,
  AlertTriangle,
  Settings,
  ChevronRight,
  Sliders,
  Sparkles,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// TYPES
// ============================================================================

export type CockpitView = "overview" | "trends" | "breakdown" | "merchants" | "recurring" | "anomalies";

interface CockpitShellProps {
  children: React.ReactNode;
  filterPanel?: React.ReactNode;
  activeAnomalies?: number;
}

// ============================================================================
// TAB CONFIG
// ============================================================================

const TABS: { id: CockpitView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "trends", label: "Tendências", icon: LineChart },
  { id: "breakdown", label: "Detalhamento", icon: ListTree },
  { id: "merchants", label: "Comerciantes", icon: Store },
  { id: "recurring", label: "Recorrentes", icon: RotateCcw },
  { id: "anomalies", label: "Anomalias", icon: AlertTriangle },
];

// ============================================================================
// SKELETON
// ============================================================================

function CockpitSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[400px] rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SHELL
// ============================================================================

export function CockpitShell({ children, filterPanel, activeAnomalies = 0 }: CockpitShellProps) {
  const { params, updateParams } = useAnalyticsQuery();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  const currentView = (params.view as CockpitView) || "overview";

  return (
    <div className="min-h-screen bg-background">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Title & Tabs */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Analytics
                </h1>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  COCKPIT
                </Badge>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden lg:flex items-center bg-muted/50 p-1 rounded-xl">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentView === tab.id;
                  const hasNotification = tab.id === "anomalies" && activeAnomalies > 0;

                  return (
                    <Link
                      key={tab.id}
                      href={{ query: { ...params, view: tab.id } }}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {hasNotification && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {activeAnomalies > 9 ? "9+" : activeAnomalies}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* AI Insights Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Insights
              </Button>

              {/* Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filter Panel Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl lg:hidden"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              >
                <Sliders className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden pb-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;

                return (
                  <Link
                    key={tab.id}
                    href={{ query: { ...params, view: tab.id } }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex">
        {/* Main Canvas */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
            <Suspense fallback={<CockpitSkeleton />}>
              {children}
            </Suspense>
          </div>
        </main>

        {/* Filter Panel - Desktop */}
        {filterPanel && isFilterPanelOpen && (
          <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
            {filterPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TAB CONTENT WRAPPER
// ============================================================================

interface TabContentProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CockpitTabContent({ title, description, actions, children }: TabContentProps) {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}

// ============================================================================
// SECTION WRAPPER
// ============================================================================

interface CockpitSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function CockpitSection({ title, description, className, children }: CockpitSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

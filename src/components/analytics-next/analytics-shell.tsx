"use client";

import { useAnalyticsQuery } from "@/hooks/use-analytics-query";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LineChart, ListTree, Store, RotateCcw, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { AnalyticsSkeleton } from "./analytics-skeleton";

interface AnalyticsShellProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function AnalyticsShell({ children, headerActions }: AnalyticsShellProps) {
  const { params } = useAnalyticsQuery();

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "trends", label: "Tendências", icon: LineChart },
    { id: "breakdown", label: "Detalhamento", icon: ListTree },
    { id: "merchants", label: "Comerciantes", icon: Store },
    { id: "recurring", label: "Recorrentes", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Global Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold tracking-tight text-foreground hidden md:block">
              Analytics <span className="text-emerald-500 font-mono text-sm ml-1">BETA</span>
            </h1>
            
            {/* Navigation Tabs */}
            <nav className="flex items-center bg-secondary/50 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = params.view === tab.id;
                
                return (
                 <Link
                    key={tab.id}
                    href={{ query: { ...params, view: tab.id } }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border font-bold text-emerald-700"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
             {headerActions}
             <Button variant="outline" size="sm" className="hidden md:flex gap-2 rounded-xl font-bold" onClick={() => alert("Export started...")}>
                <Download className="w-4 h-4" />
                Exportar
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <Suspense fallback={<AnalyticsSkeleton />}>
           {children}
        </Suspense>
      </main>
    </div>
  );
}

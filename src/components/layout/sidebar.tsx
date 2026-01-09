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
    { id: "dashboard", icon: LayoutDashboard, href: "/dashboard", label: sidebarLabels.items.dashboard },
    { id: "transactions", icon: Receipt, href: "/transactions", label: sidebarLabels.items.transactions },
    { id: "goals", icon: Target, href: "/goals", label: sidebarLabels.items.goals },
    { id: "insights", icon: TrendingUp, href: "/insights", label: sidebarLabels.items.insights },
    { id: "accounts", icon: Wallet, href: "/accounts", label: sidebarLabels.items.accounts },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1a2c26] border-b border-gray-100 dark:border-gray-800 z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
             <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight dark:text-white">RitualFin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="dark:text-white">
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
        "fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-[#1a2c26] border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0 w-72 p-6 flex flex-col justify-between",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/20 flex items-center justify-center bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-[#1a2c26]"></span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#111816] dark:text-white text-xl font-bold leading-tight font-display">RitualFin</h1>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide leading-tight">Finanças claras, riqueza a dois</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary/10 text-primary-dark dark:text-primary font-bold shadow-sm" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 group-hover:scale-110 transition-transform",
                    isActive ? "text-primary-dark dark:text-primary" : "text-gray-400 dark:text-gray-500"
                  )} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium group",
              pathname === "/settings" && "bg-gray-50 dark:bg-white/5 font-bold"
            )}
          >
            <Settings className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:rotate-45 transition-transform" />
            <span className="text-sm">{sidebarLabels.items.settings}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 font-medium group"
          >
            <LogOut className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">{sidebarLabels.items.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

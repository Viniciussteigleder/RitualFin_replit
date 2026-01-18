"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Plus, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: Receipt },
  { href: "/add", label: "Adicionar", icon: Plus, isCenter: true },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/settings", label: "Definições", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden bg-white dark:bg-[#1a2c26] border-t border-gray-100 dark:border-gray-800 p-2 flex justify-around items-center fixed bottom-0 w-full z-20 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

        if (item.isCenter) {
          return (
            <div key={item.href} className="relative -top-5">
              <button className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-[#111816] hover:scale-105 active:scale-95 transition-all">
                <Plus className="h-8 w-8" />
              </button>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] p-2 transition-colors rounded-lg active:bg-primary/10",
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

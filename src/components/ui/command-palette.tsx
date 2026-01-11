"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Target,
  PieChart,
  Wallet,
  CalendarDays,
  RefreshCw,
  Settings,
  Sparkles,
  BarChart3,
  Upload,
  Bot,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  keywords?: string[];
  shortcut?: string;
}

const navigationItems: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    keywords: ["home", "overview", "resumo"],
    shortcut: "G D",
  },
  {
    id: "analytics",
    label: "Análise Total",
    icon: BarChart3,
    href: "/analytics",
    keywords: ["analytics", "reports", "relatórios"],
    shortcut: "G A",
  },
  {
    id: "transactions",
    label: "Transações",
    icon: Receipt,
    href: "/transactions",
    keywords: ["extrato", "transactions", "payments"],
    shortcut: "G T",
  },
  {
    id: "confirm",
    label: "Sugestões IA",
    icon: Sparkles,
    href: "/confirm",
    keywords: ["ai", "review", "revisar", "suggestions"],
    shortcut: "G R",
  },
  {
    id: "calendar",
    label: "Calendário",
    icon: CalendarDays,
    href: "/calendar",
    keywords: ["calendar", "events", "eventos"],
    shortcut: "G C",
  },
  {
    id: "rituals",
    label: "Rituais",
    icon: RefreshCw,
    href: "/rituals",
    keywords: ["rituals", "habits", "hábitos"],
    shortcut: "G H",
  },
  {
    id: "goals",
    label: "Metas",
    icon: Target,
    href: "/goals",
    keywords: ["goals", "targets", "objetivos"],
    shortcut: "G M",
  },
  {
    id: "budgets",
    label: "Orçamentos",
    icon: PieChart,
    href: "/budgets",
    keywords: ["budgets", "spending", "gastos"],
    shortcut: "G B",
  },
  {
    id: "accounts",
    label: "Contas",
    icon: Wallet,
    href: "/accounts",
    keywords: ["accounts", "cards", "cartões"],
    shortcut: "G O",
  },
  {
    id: "uploads",
    label: "Importar Ficheiros",
    icon: Upload,
    href: "/uploads",
    keywords: ["upload", "import", "importar"],
    shortcut: "G U",
  },
  {
    id: "rules",
    label: "Regras de IA",
    icon: Bot,
    href: "/settings/rules",
    keywords: ["rules", "automation", "automação"],
    shortcut: "G I",
  },
  {
    id: "settings",
    label: "Definições",
    icon: Settings,
    href: "/settings",
    keywords: ["settings", "preferences", "preferências"],
    shortcut: "G S",
  },
];

/**
 * Command Palette Component
 * Keyboard-first navigation with ⌘K shortcut
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // G + letter shortcuts (when command palette is closed)
      if (!open && e.key === "g") {
        // Listen for next key press
        const handleSecondKey = (e2: KeyboardEvent) => {
          e2.preventDefault();
          const item = navigationItems.find((item) => {
            const shortcut = item.shortcut?.split(" ")[1]?.toLowerCase();
            return shortcut === e2.key.toLowerCase();
          });
          if (item) {
            router.push(item.href);
          }
          document.removeEventListener("keydown", handleSecondKey);
        };
        document.addEventListener("keydown", handleSecondKey, { once: true });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, router]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Pesquisar páginas e ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          {navigationItems.slice(0, 4).map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.keywords?.join(" ")}`}
              onSelect={() => {
                runCommand(() => router.push(item.href));
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {item.shortcut.split(" ").map((key, i) => (
                    <span key={i}>{key}</span>
                  ))}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Planejamento">
          {navigationItems.slice(4, 9).map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.keywords?.join(" ")}`}
              onSelect={() => {
                runCommand(() => router.push(item.href));
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {item.shortcut.split(" ").map((key, i) => (
                    <span key={i}>{key}</span>
                  ))}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Configurações">
          {navigationItems.slice(9).map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.keywords?.join(" ")}`}
              onSelect={() => {
                runCommand(() => router.push(item.href));
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {item.shortcut.split(" ").map((key, i) => (
                    <span key={i}>{key}</span>
                  ))}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Keyboard Shortcuts Help Component
 * Shows available shortcuts to users
 */
export function KeyboardShortcutsHelp() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold mb-2">Navegação Rápida</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Abrir comando</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>
          {navigationItems.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {item.shortcut?.split(" ").map((key, i) => (
                  <span key={i}>{key}</span>
                ))}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

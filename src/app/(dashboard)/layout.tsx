import { Sidebar } from "@/components/layout/sidebar";
import { MonthProvider } from "@/lib/month-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { FloatingAssistant } from "@/components/assistant/floating-assistant";
import { UiPerfFixesRoot } from "@/components/perf/ui-perf-fixes-root";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MonthProvider>
      <UiPerfFixesRoot />
      <div className="flex min-h-screen">
        <Sidebar aria-label="Sidebar" />
        <main className="flex-1 md:pl-72 pt-16 md:pt-0 min-h-screen relative overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <FloatingAssistant />
    </MonthProvider>
  );
}

import { TopNav } from "./top-nav";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  showMonthSelector?: boolean;
}

export default function AppLayout({ children, showMonthSelector = true }: AppLayoutProps) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNav month={month} onMonthChange={setMonth} />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

export { AppLayout };

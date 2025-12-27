import { TopNav } from "./top-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

export { AppLayout };

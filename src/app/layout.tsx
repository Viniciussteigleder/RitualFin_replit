import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { MonthProvider } from "@/lib/month-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "RitualFin",
  description: "Financial Ritual Orchestrator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground flex min-h-screen">
        <MonthProvider>
          <Sidebar />
          <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
             <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {children}
               </div>
             </div>
          </main>
        </MonthProvider>
      </body>
    </html>
  );
}

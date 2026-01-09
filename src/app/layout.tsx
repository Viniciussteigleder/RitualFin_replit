import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { MonthProvider } from "@/lib/month-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const notoTabs = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html lang="en" className={`${manrope.variable} ${notoTabs.variable}`}>
      <body className="antialiased bg-background text-foreground flex min-h-screen font-sans">
        <MonthProvider>
          <Sidebar />
          <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 pb-16 lg:pb-0 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
              </div>
            </div>
          </main>
          <MobileNav />
        </MonthProvider>
      </body>
    </html>
  );
}

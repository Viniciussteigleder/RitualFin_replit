import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { MonthProvider } from "@/lib/month-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { FloatingAssistant } from "@/components/assistant/floating-assistant";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";

// Validate environment variables on startup
import "@/lib/env";

const fontSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
});

const fontDisplay = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "RitualFin",
  description: "Financial Ritual Orchestrator",
  icons: {
    icon: [{ url: "/RitualFin%20Logo.png", type: "image/png" }],
    apple: [{ url: "/RitualFin%20Logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} antialiased bg-background text-foreground flex min-h-screen font-sans`}
        suppressHydrationWarning
      >
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
          <CommandPalette />
          <FloatingAssistant />
        </MonthProvider>
      </body>
    </html>
  );
}

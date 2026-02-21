import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Validate environment variables on startup
import "@/lib/env";

// Performance optimization: Use system font stack to avoid network requests
// Original: Noto_Sans, Manrope from next/font/google
// Benefit: ~50-100ms faster LCP, no FOUT, works offline
// System fonts defined in globals.css
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
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
    <html
      lang="pt-PT"
      suppressHydrationWarning
      data-ui-perf-fixes={process.env.NEXT_PUBLIC_UI_PERF_FIXES !== "0" ? "1" : undefined}
    >
      <body
        className={`${roboto.className} ${roboto.variable} antialiased bg-background text-foreground flex min-h-screen`}
        suppressHydrationWarning
      >
        <div className="flex-1">
          {children}
        </div>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

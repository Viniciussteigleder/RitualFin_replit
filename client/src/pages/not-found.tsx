/**
 * 404 Not Found Page
 *
 * Delightful error state with clear next steps
 * Following Steve Krug's principle: "Don't make me think"
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Home, Search, ArrowLeft, FileQuestion, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { animations, buttonPress } from "@/lib/animations";
import { useLocale } from "@/hooks/use-locale";
import { notFoundCopy, t as translate } from "@/lib/i18n";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const locale = useLocale();

  const popularPages = [
    { label: translate(locale, notFoundCopy.pageDashboard), href: "/dashboard", icon: Home },
    { label: translate(locale, notFoundCopy.pageUploads), href: "/uploads", icon: FileQuestion },
    { label: translate(locale, notFoundCopy.pageTransactions), href: "/transactions", icon: Search },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <div className={cn(
        "w-full max-w-2xl",
        animations.fadeScaleIn,
        animations.duration[500]
      )}>
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            {/* Animated 404 illustration */}
            <div className={cn(
              "flex flex-col items-center space-y-6",
              animations.fadeInDown,
              animations.duration[500]
            )}>
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                  <Compass className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: "8s" }} />
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-20">
                  <div className="w-full h-full bg-primary rounded-full" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  404
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {translate(locale, notFoundCopy.title)}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {translate(locale, notFoundCopy.subtitle)}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className={cn(
              "space-y-4",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[200]
            )}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className={cn(
                    "flex-1 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:shadow-lg group",
                    buttonPress
                  )}
                >
                  <Home className="w-5 h-5 mr-2" />
                  {translate(locale, notFoundCopy.backDashboard)}
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className={cn(
                    "flex-1 h-12 text-base font-medium rounded-xl border-2 hover:bg-gray-50 group",
                    buttonPress
                  )}
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  {translate(locale, notFoundCopy.back)}
                </Button>
              </div>
            </div>

            {/* Popular pages */}
            <div className={cn(
              "space-y-3",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[400]
            )}>
              <p className="text-sm font-medium text-muted-foreground text-center">
                {translate(locale, notFoundCopy.popularPages)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {popularPages.map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.href}
                      onClick={() => setLocation(page.href)}
                      className={cn(
                        "p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all duration-200 hover:scale-105 group",
                        buttonPress,
                        animations.fadeIn,
                        `delay-[${(index + 1) * 100}ms]`
                      )}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform duration-200" />
                      <p className="text-sm font-medium text-foreground">{page.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Help text */}
            <div className={cn(
              "bg-blue-50 border border-blue-200 rounded-xl p-4",
              animations.fadeIn,
              animations.duration[500],
              animations.delay[600]
            )}>
              <p className="text-sm text-blue-900 text-center">
                <strong>{translate(locale, notFoundCopy.helpTitle)}</strong>{" "}
                {translate(locale, notFoundCopy.helpBody)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

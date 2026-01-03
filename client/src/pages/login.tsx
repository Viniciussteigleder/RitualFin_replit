/**
 * Login Page
 *
 * Enhanced with world-class UX principles:
 * - Jony Ive: Simplicity and clarity
 * - Luke Wroblewski: Mobile-first, obvious inputs
 * - Aarron Walter: Emotional design with subtle animations
 * - Steve Krug: Don't make me think
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { animations, buttonPress, focusRing } from "@/lib/animations";
import { useLocale } from "@/hooks/use-locale";
import { loginCopy, t as translate } from "@/lib/i18n";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const locale = useLocale();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email || "demo", password || "demo"),
    onSuccess: () => {
      // Delay navigation for success animation
      setTimeout(() => setLocation("/dashboard"), 400);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const isSuccess = loginMutation.isSuccess;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "2s" }} />
      </div>

      <div className={cn(
        "w-full max-w-md",
        animations.fadeScaleIn,
        animations.duration[500]
      )}>
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-8">
            {/* Logo and branding */}
            <div className={cn(
              "flex flex-col items-center space-y-3",
              animations.fadeInDown,
              animations.duration[500]
            )}>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full animate-ping opacity-75" />
              </div>
                <div className="text-center">
                  <h1 className="font-bold text-2xl text-foreground tracking-tight">RitualFin</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{translate(locale, loginCopy.tagline)}</p>
                </div>
            </div>

            {/* Welcome message */}
            <div className={cn(
              "text-center space-y-2",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[100]
            )}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {translate(locale, loginCopy.welcomeTitle)}
              </h2>
              <p className="text-muted-foreground">
                {translate(locale, loginCopy.welcomeSubtitle)}
              </p>
            </div>

            {/* Demo mode notice */}
            <div className={cn(
              "bg-primary/5 border border-primary/20 rounded-xl p-4",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[200]
            )}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{translate(locale, loginCopy.demoTitle)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {translate(locale, loginCopy.demoBody)}
                  </p>
                </div>
              </div>
            </div>

            {/* Google login button */}
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 text-base font-medium border-2 rounded-xl hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 shadow-sm",
                buttonPress,
                focusRing,
                animations.fadeInUp,
                animations.duration[500],
                animations.delay[300]
              )}
              type="button"
              onClick={() => loginMutation.mutate()}
              disabled={loginMutation.isPending || isSuccess}
              data-testid="btn-google-login"
            >
              {isSuccess ? (
                <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600 animate-in zoom-in-0 duration-300" />
              ) : (
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isSuccess
                ? translate(locale, loginCopy.googleSuccess)
                : translate(locale, loginCopy.googleContinue)}
            </Button>

            {/* Divider */}
            <div className={cn(
              "relative",
              animations.fadeIn,
              animations.duration[500],
              animations.delay[400]
            )}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-muted-foreground font-medium">
                  {translate(locale, loginCopy.divider)}
                </span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleLogin} className={cn(
              "space-y-5",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[500]
            )}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">{translate(locale, loginCopy.emailLabel)}</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={translate(locale, loginCopy.emailPlaceholder)}
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white transition-all duration-200",
                      focusedField === "email" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">{translate(locale, loginCopy.passwordLabel)}</Label>
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline font-medium transition-colors duration-200"
                  >
                    {translate(locale, loginCopy.forgot)}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={translate(locale, loginCopy.passwordPlaceholder)}
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white pr-12 transition-all duration-200",
                      focusedField === "password" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group",
                  buttonPress,
                  focusRing
                )}
                disabled={loginMutation.isPending || isSuccess}
                data-testid="btn-login"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {translate(locale, loginCopy.loginLoading)}
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 animate-in zoom-in-0 duration-300" />
                    {translate(locale, loginCopy.loginSuccess)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {translate(locale, loginCopy.loginAction)}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <p className={cn(
              "text-center text-sm text-muted-foreground",
              animations.fadeIn,
              animations.duration[500],
              animations.delay[600]
            )}>
              {translate(locale, loginCopy.signupPrompt)}{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline transition-colors duration-200"
              >
                {translate(locale, loginCopy.signupCta)}
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className={cn(
          "mt-8 text-center text-sm text-muted-foreground",
          animations.fadeIn,
          animations.duration[700],
          animations.delay[800]
        )}>
          &copy; 2025 RitualFin. {translate(locale, loginCopy.footer)}
        </p>
      </div>
    </div>
  );
}

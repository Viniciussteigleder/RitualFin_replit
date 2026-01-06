/**
 * Signup Page
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
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { animations, buttonPress, focusRing } from "@/lib/animations";
import { useLocale } from "@/hooks/use-locale";
import { loginCopy, t as translate } from "@/lib/i18n";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const locale = useLocale();

  const signupMutation = useMutation({
    mutationFn: () => {
      if (!username || !email || !password) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }
      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem");
      }
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      return authApi.signup(username, email, password);
    },
    onSuccess: () => {
      setError("");
      // Delay navigation for success animation
      setTimeout(() => setLocation("/dashboard"), 400);
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signupMutation.mutate();
  };

  const isSuccess = signupMutation.isSuccess;

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
                Crie sua conta
              </h2>
              <p className="text-muted-foreground">
                Comece a gerenciar suas finanças hoje
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className={cn(
                "bg-red-50 border border-red-200 rounded-xl p-4",
                animations.fadeInUp,
                animations.duration[300]
              )}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Signup form */}
            <form onSubmit={handleSignup} className={cn(
              "space-y-5",
              animations.fadeInUp,
              animations.duration[500],
              animations.delay[200]
            )}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Nome de usuário</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu_usuario"
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white transition-all duration-200",
                      focusedField === "username" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white transition-all duration-200",
                      focusedField === "email" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white pr-12 transition-all duration-200",
                      focusedField === "password" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    className={cn(
                      "h-12 rounded-xl border-2 bg-white pr-12 transition-all duration-200",
                      focusedField === "confirmPassword" && "border-primary ring-4 ring-primary/10",
                      focusRing
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                disabled={signupMutation.isPending || isSuccess}
                data-testid="btn-signup"
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 animate-in zoom-in-0 duration-300" />
                    Conta criada!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Criar conta
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login link */}
            <p className={cn(
              "text-center text-sm text-muted-foreground",
              animations.fadeIn,
              animations.duration[500],
              animations.delay[300]
            )}>
              Já tem uma conta?{" "}
              <Link href="/login">
                <button
                  type="button"
                  className="text-primary font-medium hover:underline transition-colors duration-200"
                >
                  Faça login
                </button>
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className={cn(
          "mt-8 text-center text-sm text-muted-foreground",
          animations.fadeIn,
          animations.duration[700],
          animations.delay[400]
        )}>
          &copy; 2025 RitualFin. {translate(locale, loginCopy.footer)}
        </p>
      </div>
    </div>
  );
}

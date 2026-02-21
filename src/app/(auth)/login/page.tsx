"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trackAuthEvent, LoginErrorType } from "@/lib/analytics-tracker";

// --- Validation Schema ---
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// --- Helper Functions ---
const getErrorMessage = (error: string | null): string | null => {
  if (!error) return null;
  
  if (error === "CredentialsSignin") {
    return "Sign-in failed. Check your details and try again.";
  }
  if (error === "OAuthAccountNotLinked") {
    return "Account exists with another provider. Please sign in with Google.";
  }
  // Generic fallback for unknown errors
  return "Something went wrong. Please try again.";
};

// --- Main Page Component ---
export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur as requested
  });

  // Track page view on mount
  useEffect(() => {
    trackAuthEvent("login_view");
    
    // Check for URL errors from redirects (e.g. from middleware or provider)
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const msg = getErrorMessage(errorParam);
      setGlobalError(msg);
      trackAuthEvent("login_error", { error_type: "auth", code: errorParam });
    }
  }, [searchParams]);

  // Handle Form Submission
  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    trackAuthEvent("login_submit");

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
          callbackUrl: "/",
        });

        if (result?.error) {
          // Handle auth failure
          const msg = getErrorMessage(result.error);
          setGlobalError(msg || "Sign-in failed. Check your details and try again.");
          trackAuthEvent("login_error", { error_type: "auth" });
        } else if (result?.ok) {
          // Success
          trackAuthEvent("login_success", { method: "credentials" });
          router.push(result.url || "/");
          router.refresh();
        }
      } catch (err) {
        // Network/Unexpected error
        setGlobalError("Something went wrong. Please try again.");
        trackAuthEvent("login_error", { error_type: "network" });
      }
    });
  };

  // Handle SSO Click
  const handleSSOClick = () => {
    trackAuthEvent("login_sso_click", { provider: "google" });
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="w-full max-w-[440px] px-6 py-12 sm:px-0">
      
      {/* Branding Section */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <Link 
          href="/" 
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-primary/10 ring-1 ring-primary/20 transition-transform hover:scale-105 active:scale-95"
          aria-label="RitualFin Home"
        >
          <Image 
            src="/logo.png" 
            alt="RitualFin" 
            width={44} 
            height={44} 
            className="h-10 w-10 object-contain"
            priority
          />
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Entre na sua conta para continuar.
        </p>
      </div>

      <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_20px_rgba(16,185,129,0.05)] dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <CardHeader className="hidden">
           <CardTitle>Sign in</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          
          {/* Global Error Message */}
          {globalError && (
            <div 
              role="alert" 
              aria-live="polite" 
              className="flex items-center gap-3 p-4 text-sm font-medium text-destructive bg-destructive/5 rounded-xl border border-destructive/10 animate-in zoom-in-95 duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email Field */}
            <div className="group space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              />
              {form.formState.errors.email && (
                <p id="email-error" className="text-xs text-destructive font-medium ml-1 animate-slide-up">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  onClick={() => trackAuthEvent("password_reset_click")}
                >
                  Forgot?
                </Link>
              </div>
              
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400 pr-12"
                  {...form.register("password")}
                  aria-invalid={!!form.formState.errors.password}
                  aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 text-zinc-400 hover:text-zinc-600 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {form.formState.errors.password && (
                <p id="password-error" className="text-xs text-destructive font-medium ml-1 animate-slide-up">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" 
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-bold">
                Identity
              </span>
            </div>
          </div>

          {/* SSO Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]" 
            onClick={handleSSOClick}
            disabled={isPending}
          >
            <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            <span>Continue with Google</span>
          </Button>
        </CardContent>
        
        <CardFooter className="pb-8 pt-2">
          <div className="w-full text-center text-sm font-medium">
            <span className="text-zinc-500 dark:text-zinc-400">Need an account? </span>
            <Link 
              href="/signup" 
              className="text-primary hover:underline underline-offset-4 decoration-primary/30"
              onClick={() => trackAuthEvent("create_account_click")}
            >
              Get started for free
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Trust Footer */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">
          &copy; {new Date().getFullYear()} RitualFin. All rights reserved.
        </p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-5 sm:p-8">
      
      {/* Container: Centered Card (Tablet/Desktop) or Full Width (Mobile) */}
      <div className="w-full max-w-[440px] space-y-6">
        
        {/* Card Component from Design System */}
        <Card className="border-0 shadow-none sm:shadow-lg sm:border sm:border-border/50 bg-card">
          <CardHeader className="space-y-1 pb-6 text-center">
            {/* Logo */}
            <div className="mx-auto mb-4 relative flex items-center justify-center">
               {/* Clickable Logo -> Home */}
               <Link href="/" aria-label="Go to home">
                  <Image 
                    src="/RitualFin Logo.png" 
                    alt="RitualFin" 
                    width={48} 
                    height={48} 
                    className="h-12 w-12 object-contain"
                    priority
                  />
               </Link>
            </div>
            
            {/* Minimal Headline */}
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Sign in
            </CardTitle>
            
            {/* Optional Subtext */}
            <CardDescription className="text-sm text-muted-foreground">
              Use your work email.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Global Error Message */}
            {globalError && (
              <div 
                role="alert" 
                aria-live="polite" 
                className="flex items-center gap-2 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            {/* SSO Button */}
            <Button 
              variant="outline" 
              className="w-full h-11 font-medium relative" 
              onClick={handleSSOClick}
              disabled={isPending}
            >
              {/* Google Icon SVG */}
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 bg-background"
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                  aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                />
                {form.formState.errors.email && (
                  <p id="email-error" className="text-xs text-destructive font-medium animate-slide-up">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                </div>
                
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 bg-background pr-10" // Extra padding for eye icon
                    {...form.register("password")}
                    aria-invalid={!!form.formState.errors.password}
                    aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                  />
                  
                  {/* Password Toggle */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 text-muted-foreground hover:bg-transparent"
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

                {/* Inline Error */}
                {form.formState.errors.password && (
                  <p id="password-error" className="text-xs text-destructive font-medium animate-slide-up">
                    {form.formState.errors.password.message}
                  </p>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1">
                   <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-primary hover:underline hover:text-primary/90"
                    onClick={() => trackAuthEvent("password_reset_click")}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm transition-all" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4 pt-0">
             {/* Secondary CTA */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link 
                href="/signup" 
                className="font-medium text-primary hover:underline"
                onClick={() => trackAuthEvent("create_account_click")}
              >
                Create account
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground hover:underline decoration-muted-foreground/30">
            Terms
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-foreground hover:underline decoration-muted-foreground/30">
            Privacy
          </Link>
        </div>

      </div>
    </div>
  );
}

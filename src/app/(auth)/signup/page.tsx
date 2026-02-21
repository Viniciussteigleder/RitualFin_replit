"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { registerUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-12 text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" 
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        "Create account"
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [errorMessage, dispatch] = useFormState(registerUser, undefined);

  return (
    <div className="w-full max-w-[440px] px-6 py-12 sm:px-0">
      
      {/* Branding Section */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <Link 
          href="/" 
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-primary/5 ring-1 ring-zinc-200 dark:ring-zinc-800 transition-transform hover:scale-105 active:scale-95"
          aria-label="RitualFin Home"
        >
          <Image 
            src="/RitualFin Logo.png" 
            alt="RitualFin" 
            width={44} 
            height={44} 
            className="h-10 w-10 object-contain"
          />
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Start your financial ritual today.
        </p>
      </div>

      <Card className="border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_20px_rgba(16,185,129,0.05)] dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <CardContent className="pt-8 space-y-6">
          <form action={dispatch} className="space-y-5">
            <div className="group space-y-2">
              <Label htmlFor="username" className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="ritualist"
                required
                className="h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
              />
            </div>
            <div className="group space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
              />
            </div>
            <div className="group space-y-2">
              <Label htmlFor="password" className="text-[13px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400"
              />
            </div>
            
            {errorMessage && (
              <div 
                role="alert" 
                className="text-sm font-medium text-destructive bg-destructive/5 rounded-xl border border-destructive/10 p-4 animate-in zoom-in-95 duration-200"
              >
                {errorMessage}
              </div>
            )}

            <SubmitButton />
          </form>
        </CardContent>

        <CardFooter className="pb-8 pt-2">
          <div className="w-full text-center text-sm font-medium">
            <span className="text-zinc-500 dark:text-zinc-400">Already have an account? </span>
            <Link 
              href="/login" 
              className="text-primary hover:underline underline-offset-4 decoration-primary/30"
            >
              Sign back in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Trust Footer */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} RitualFin. Secure & Private.
        </p>
      </div>
    </div>
  );
}

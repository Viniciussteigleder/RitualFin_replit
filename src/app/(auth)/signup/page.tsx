"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "@/lib/actions/auth";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full h-11" type="submit" disabled={pending}>
      {pending ? "Creating account..." : "Sign Up"}
    </Button>
  );
}

export default function SignupPage() {
  const [errorMessage, dispatch] = useFormState(registerUser, undefined);

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-xl shadow-lg border border-border/50">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-sm text-muted-foreground">
            Start your financial ritual today
          </p>
        </div>

        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="ritualist"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          
          {errorMessage && (
            <div className="text-sm text-destructive font-medium text-center">
              {errorMessage}
            </div>
          )}

          <SubmitButton />
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

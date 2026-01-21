"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and email preferences.
        </p>
      </div>
      
      <div className="flex flex-col gap-8">
        <nav className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
             <Link href="/settings">
                <Button variant="ghost" className="rounded-xl font-bold hover:bg-secondary">Profile</Button>
            </Link>
            <Link href="/settings/rules">
                <Button variant="ghost" className="rounded-xl font-bold hover:bg-secondary">Rules Engine</Button>
            </Link>
            <Link href="/settings/taxonomy">
                <Button variant="ghost" className="rounded-xl font-bold hover:bg-secondary">Taxonomy</Button>
            </Link>
            <Link href="/admin/diagnostics">
                <Button variant="ghost" className="rounded-xl font-bold hover:bg-secondary">Diagnóstico</Button>
            </Link>
        </nav>
        <div className="flex-1 w-full max-w-full">{children}</div>
      </div>
    </div>
  );
}

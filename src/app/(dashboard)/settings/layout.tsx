"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and email preferences.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start">Profile</Button>
                </Link>
                <Link href="/settings/rules">
                    <Button variant="ghost" className="w-full justify-start">Rules Engine</Button>
                </Link>
                <Link href="/settings/taxonomy">
                    <Button variant="ghost" className="w-full justify-start">Taxonomy</Button>
                </Link>
            </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}

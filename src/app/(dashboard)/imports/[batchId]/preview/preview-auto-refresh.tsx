"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PreviewAutoRefresh({ intervalMs = 2500 }: { intervalMs?: number }) {
  const router = useRouter();
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTicks((t) => t + 1);
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, router]);

  const seconds = useMemo(() => Math.round((ticks * intervalMs) / 1000), [intervalMs, ticks]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground font-medium">Atualizando automaticamente… ({seconds}s)</div>
      <Button type="button" variant="outline" className="h-9 rounded-xl font-bold" onClick={() => router.refresh()}>
        Atualizar agora
      </Button>
    </div>
  );
}


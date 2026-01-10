"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export function SyncStatus({ lastSync }: { lastSync: Date | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="text-base font-semibold text-foreground">Carregando...</span>;
  }

  return (
    <span className="text-base font-semibold text-foreground" suppressHydrationWarning>
      {lastSync ? `Atualizado ${formatDistanceToNow(new Date(lastSync), { addSuffix: true, locale: pt })}` : "Nenhum arquivo importado"}
    </span>
  );
}

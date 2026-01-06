import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

/**
 * Auth Warning Banner
 *
 * Displays a security warning when the app is running with a demo user.
 * This is a critical security notice for users to understand the limitations.
 *
 * The banner:
 * - Shows only when logged in as "demo" user
 * - Can be dismissed but reappears on new sessions
 * - Uses warning colors (amber) to draw attention
 */
export function AuthWarningBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    retry: false,
  });

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem("auth-warning-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("auth-warning-dismissed", "true");
    setIsDismissed(true);
  };

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  // Only show banner if user is logged in as "demo" user
  const isDemoAuth = user?.username === "demo";

  if (!isDemoAuth) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              <strong>Modo Demonstração:</strong> Este aplicativo usa autenticação simplificada.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Não adequado para produção. Todos os dados são visíveis para usuários autenticados.
              Autenticação multi-usuário com RLS será implementada na Fase D.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100 flex-shrink-0"
          onClick={handleDismiss}
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

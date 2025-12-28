/**
 * Keyboard Shortcuts Overlay
 *
 * Help overlay showing all available keyboard shortcuts
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category?: string;
}

const SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["?"],
    description: "Mostrar/ocultar atalhos",
    category: "Geral"
  },
  {
    keys: ["Esc"],
    description: "Fechar modal ou diálogo",
    category: "Geral"
  },
  {
    keys: ["Enter"],
    description: "Confirmar transação selecionada",
    category: "Confirmação"
  },
  {
    keys: ["↑", "↓"],
    description: "Navegar entre transações",
    category: "Confirmação"
  },
  {
    keys: ["Space"],
    description: "Selecionar/desselecionar transação",
    category: "Confirmação"
  },
  {
    keys: ["Ctrl", "A"],
    description: "Selecionar todas as transações",
    category: "Confirmação"
  },
  {
    keys: ["/"],
    description: "Focar na busca",
    category: "Transações"
  },
  {
    keys: ["Ctrl", "K"],
    description: "Busca rápida (em breve)",
    category: "Geral"
  }
];

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category || "Outros")));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => (s.category || "Outros") === category).map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          {keyIdx > 0 && <span className="text-muted-foreground text-xs">+</span>}
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-0.5 bg-white"
                          >
                            {key === "Ctrl" && <Command className="w-3 h-3 mr-1" />}
                            {key}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Pressione <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> a qualquer momento para ver estes atalhos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

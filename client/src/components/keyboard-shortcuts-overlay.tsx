/**
 * Keyboard Shortcuts Overlay
 *
 * Help overlay showing all available keyboard shortcuts
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { keyboardShortcutsCopy, t as translate } from "@/lib/i18n";

interface KeyboardShortcut {
  keys: string[];
  description: keyof typeof keyboardShortcutsCopy;
  category?: string;
}

const SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["?"],
    description: "toggleShortcuts",
    category: "general"
  },
  {
    keys: ["Esc"],
    description: "closeDialog",
    category: "general"
  },
  {
    keys: ["Enter"],
    description: "confirmTransaction",
    category: "confirmation"
  },
  {
    keys: ["↑", "↓"],
    description: "navigateTransactions",
    category: "confirmation"
  },
  {
    keys: ["Space"],
    description: "toggleSelection",
    category: "confirmation"
  },
  {
    keys: ["Ctrl", "A"],
    description: "selectAll",
    category: "confirmation"
  },
  {
    keys: ["/"],
    description: "focusSearch",
    category: "transactions"
  },
  {
    keys: ["Ctrl", "K"],
    description: "quickSearch",
    category: "general"
  }
];

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const locale = useLocale();
  const categoryLabels: Record<string, string> = {
    general: translate(locale, keyboardShortcutsCopy.categoryGeneral),
    confirmation: translate(locale, keyboardShortcutsCopy.categoryConfirmation),
    transactions: translate(locale, keyboardShortcutsCopy.categoryTransactions),
    other: translate(locale, keyboardShortcutsCopy.categoryOther)
  };
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category || "other")));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            {translate(locale, keyboardShortcutsCopy.title)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => (s.category || "other") === category).map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">{translate(locale, keyboardShortcutsCopy[shortcut.description])}</span>
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
            <strong>{translate(locale, keyboardShortcutsCopy.tipLabel)}</strong>{" "}
            {translate(locale, keyboardShortcutsCopy.tipPrefix)}{" "}
            <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge>{" "}
            {translate(locale, keyboardShortcutsCopy.tipSuffix)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

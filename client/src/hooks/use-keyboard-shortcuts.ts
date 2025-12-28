/**
 * Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts for power users:
 * - Esc: Close modals
 * - ?: Show help overlay
 * - Ctrl/Cmd + K: Quick search (future)
 */

import { useEffect, useState } from "react";

export interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  action: () => void;
  modifier?: "ctrl" | "cmd" | "shift" | "alt";
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const modifierPressed =
          !shortcut.modifier ||
          (shortcut.modifier === "ctrl" && event.ctrlKey) ||
          (shortcut.modifier === "cmd" && event.metaKey) ||
          (shortcut.modifier === "shift" && event.shiftKey) ||
          (shortcut.modifier === "alt" && event.altKey);

        if (modifierPressed && event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useHelpOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: "?",
      label: "?",
      description: "Show keyboard shortcuts",
      action: () => setIsOpen(!isOpen)
    }
  ]);

  return { isOpen, setIsOpen };
}

/**
 * AI Assistant Floating Button
 *
 * Persistent floating action button for AI chat assistant.
 * Opens AI chat modal on click.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIChatModal } from "@/components/ai-chat-modal";

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPulsing(false);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-40",
          "bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90",
          "transition-all duration-300 hover:scale-110",
          isPulsing && "animate-pulse"
        )}
        title="Assistente IA"
      >
        <Sparkles className="h-6 w-6 text-white" />
        {isPulsing && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        )}
      </Button>

      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

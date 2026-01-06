/**
 * AI Chat Modal
 *
 * Chat interface for AI assistant (UI shell only).
 * Backend integration to be implemented by Codex.
 */

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, TrendingUp, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { aiChatCopy, t as translate } from "@/lib/i18n";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type AiChatKey = keyof typeof aiChatCopy;

const QUICK_ACTIONS: Array<{ icon: typeof TrendingUp; labelKey: AiChatKey; promptKey: AiChatKey }> = [
  { icon: TrendingUp, labelKey: "quickActionMonthLabel", promptKey: "quickActionMonthPrompt" },
  { icon: Target, labelKey: "quickActionSaveLabel", promptKey: "quickActionSavePrompt" },
  { icon: FileText, labelKey: "quickActionDupesLabel", promptKey: "quickActionDupesPrompt" },
];

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const locale = useLocale();
  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: translate(locale, aiChatCopy.welcomeMessage),
    timestamp: new Date()
  };
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const handleSend = async (prompt?: string) => {
    const messageText = prompt || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (backend to be implemented by Codex)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: translate(locale, aiChatCopy.backendStub),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] p-0 gap-0 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-emerald-600 p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{translate(locale, aiChatCopy.title)}</h2>
              <p className="text-white/80 text-sm">{translate(locale, aiChatCopy.poweredBy)}</p>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-0">
              {translate(locale, aiChatCopy.beta)}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            {translate(locale, aiChatCopy.quickActions)}
          </p>
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.labelKey}
                variant="outline"
                size="sm"
                onClick={() => handleSend(translate(locale, aiChatCopy[action.promptKey]))}
                className="gap-2"
                disabled={isLoading}
              >
                <action.icon className="h-3.5 w-3.5" />
                {translate(locale, aiChatCopy[action.labelKey])}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {timeFormatter.format(message.timestamp)}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {translate(locale, aiChatCopy.userInitial)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 flex gap-2 flex-shrink-0">
          <Input
            placeholder={translate(locale, aiChatCopy.inputPlaceholder)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

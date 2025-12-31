/**
 * AI Chat Modal
 *
 * Chat interface for AI assistant.
 * Connected to backend for context-aware responses and history.
 */

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, TrendingUp, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiChatApi } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: TrendingUp, label: "Análise deste mês", prompt: "Analise meus gastos este mês e dê sugestões." },
  { icon: Target, label: "Sugerir economia", prompt: "Onde posso economizar mais?" },
  { icon: FileText, label: "Encontrar duplicatas", prompt: "Há transações duplicadas?" },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou seu assistente financeiro inteligente. Posso ajudar a analisar seus gastos, encontrar padrões, e dar sugestões personalizadas. Como posso ajudar?",
  timestamp: new Date()
};

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [location] = useLocation();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: aiChatApi.listConversations,
    enabled: isOpen,
  });

  const { data: conversationMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["ai-messages", activeConversationId],
    queryFn: () => aiChatApi.listMessages(activeConversationId as string),
    enabled: !!activeConversationId && isOpen,
  });

  const chatMutation = useMutation({
    mutationFn: (payload: { message: string; conversationId?: string; context?: { screen?: string } }) =>
      aiChatApi.chat(payload),
    onSuccess: (data) => {
      if (data?.conversationId && data.conversationId !== activeConversationId) {
        setActiveConversationId(data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, isOpen]);

  const contextLabel = useMemo(() => {
    if (location.startsWith("/dashboard")) return "Dashboard";
    if (location.startsWith("/transactions")) return "Transações";
    if (location.startsWith("/confirm")) return "Fila de Confirmação";
    if (location.startsWith("/uploads")) return "Uploads";
    if (location.startsWith("/calendar")) return "Calendário";
    if (location.startsWith("/accounts")) return "Contas";
    if (location.startsWith("/rules")) return "Regras";
    if (location.startsWith("/goals")) return "Metas";
    if (location.startsWith("/budgets")) return "Orçamentos";
    return "Geral";
  }, [location]);

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

    try {
      const response = await chatMutation.mutateAsync({
        message: messageText,
        conversationId: activeConversationId || undefined,
        context: { screen: contextLabel }
      });

      const aiMessage: Message = {
        id: response?.replyId || (Date.now() + 1).toString(),
        role: "assistant",
        content: response?.reply || "Não consegui gerar uma resposta agora.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (_error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Tive um problema ao gerar a resposta. Tente novamente.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }
    if (!conversationMessages || conversationMessages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }
    const mapped = conversationMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.createdAt)
    })) as Message[];
    setMessages(mapped);
  }, [activeConversationId, conversationMessages]);

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
              <h2 className="text-xl font-bold text-white">Assistente IA</h2>
              <p className="text-white/80 text-sm">Powered by GPT-4</p>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-0">
              Beta
            </Badge>
            <Badge className="bg-white/20 text-white border-0">
              Contexto: {contextLabel}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Ações Rápidas</p>
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleSend(action.prompt)}
                className="gap-2"
                disabled={isLoading}
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {conversations.length > 0 && (
          <div className="px-6 py-3 border-b bg-white">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Conversas recentes</p>
            <div className="flex flex-wrap gap-2">
              {conversations.slice(0, 6).map((item: any) => (
                <Badge
                  key={item.id}
                  variant={item.id === activeConversationId ? "default" : "outline"}
                  className="text-xs cursor-pointer"
                  onClick={() => setActiveConversationId(item.id)}
                >
                  {item.title?.slice(0, 30) || "Conversa"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messagesLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Carregando conversa...
            </div>
          )}
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
                  {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">V</span>
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
            placeholder="Digite sua pergunta..."
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

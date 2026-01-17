"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles, Send, User, Loader2, Lightbulb, Trash2,
    TrendingUp, PieChart, Calendar, HelpCircle, Zap,
    ChevronRight, MessageSquare, Settings, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/actions/ai-chat";
import { SAMPLE_QUESTIONS } from "@/lib/constants/ai-questions";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Message = {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

// Context-aware quick actions based on current page
const QUICK_ACTIONS: Record<string, { icon: React.ElementType; label: string; question: string }[]> = {
    dashboard: [
        { icon: TrendingUp, label: "Resumo", question: "Me dê um resumo da minha situação financeira atual" },
        { icon: PieChart, label: "Categorias", question: "Quais são minhas maiores categorias de gasto este mês?" },
        { icon: Zap, label: "Dicas", question: "Onde posso economizar baseado nos meus gastos?" },
    ],
    transactions: [
        { icon: BarChart3, label: "Análise", question: "Analise minhas transações recentes e identifique padrões" },
        { icon: HelpCircle, label: "Pendentes", question: "Quantas transações estão pendentes de revisão?" },
        { icon: TrendingUp, label: "Comparar", question: "Compare meus gastos deste mês com o mês anterior" },
    ],
    calendar: [
        { icon: Calendar, label: "Próximos", question: "Quais são meus próximos vencimentos?" },
        { icon: TrendingUp, label: "Recorrentes", question: "Liste meus gastos recorrentes" },
        { icon: PieChart, label: "Previsão", question: "Quanto vou gastar este mês considerando os vencimentos?" },
    ],
    analytics: [
        { icon: TrendingUp, label: "Tendência", question: "Qual a tendência dos meus gastos nos últimos 3 meses?" },
        { icon: PieChart, label: "Top Gastos", question: "Quais são os maiores gastos do mês?" },
        { icon: Zap, label: "Insights", question: "Me dê insights sobre minha saúde financeira" },
    ],
    general: [
        { icon: TrendingUp, label: "Resumo", question: "Como estão minhas finanças?" },
        { icon: PieChart, label: "Gastos", question: "Quanto gastei este mês?" },
        { icon: Zap, label: "Economizar", question: "Como posso economizar mais?" },
    ],
};

// Screen labels for display
const SCREEN_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    transactions: "Transações",
    calendar: "Calendário",
    analytics: "Análises",
    uploads: "Importações",
    settings: "Configurações",
    confirm: "Revisão",
    general: "Geral",
};

export function FloatingAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<Message[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();

    // Determine current screen from pathname
    const getCurrentScreen = useCallback(() => {
        if (pathname.includes("dashboard") || pathname === "/") return "dashboard";
        if (pathname.includes("transactions")) return "transactions";
        if (pathname.includes("calendar")) return "calendar";
        if (pathname.includes("analytics")) return "analytics";
        if (pathname.includes("uploads")) return "uploads";
        if (pathname.includes("settings")) return "settings";
        if (pathname.includes("confirm")) return "confirm";
        return "general";
    }, [pathname]);

    const currentScreen = getCurrentScreen();
    const quickActions = QUICK_ACTIONS[currentScreen] || QUICK_ACTIONS.general;

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            const screenLabel = SCREEN_LABELS[currentScreen] || "RitualFin";
            setMessages([{
                role: "assistant",
                content: `Olá! Sou o **Analista Ritual**, seu assistente financeiro inteligente. Estou aqui para ajudar com suas finanças.\n\nVocê está na página **${screenLabel}**. Use os botões rápidos abaixo ou faça qualquer pergunta!`,
                timestamp: new Date()
            }]);
        }
    }, [currentScreen, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    // Hide suggestions after first user message
    useEffect(() => {
        if (messages.filter(m => m.role === "user").length > 0) {
            setShowSuggestions(false);
        }
    }, [messages]);

    // Focus input when sheet opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    // Keyboard shortcut (Ctrl/Cmd + J)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "j") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSend = async (messageText?: string) => {
        const userMsg = messageText || input;
        if (!userMsg.trim()) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);

        startTransition(async () => {
            const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const result = await sendChatMessage(userMsg, conversationHistory, currentScreen);

            if (result.success && result.response) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: result.response!,
                    timestamp: new Date()
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: result.error || "Desculpe, não consegui processar sua pergunta. Tente novamente.",
                    timestamp: new Date()
                }]);
            }
        });
    };

    const handleClearChat = () => {
        const screenLabel = SCREEN_LABELS[currentScreen] || "RitualFin";
        setMessages([{
            role: "assistant",
            content: `Chat limpo! Como posso ajudar com suas finanças na página **${screenLabel}**?`,
            timestamp: new Date()
        }]);
        setShowSuggestions(true);
    };

    // Get random sample questions
    const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
    
    useEffect(() => {
        const shuffled = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
        setSampleQuestions(shuffled.slice(0, 4));
    }, []);

    function renderInlineMarkdown(text: string): React.ReactNode[] {
        const nodes: React.ReactNode[] = [];
        const boldRe = /\*\*(.+?)\*\*/g;
        let lastIndex = 0;

        for (let match = boldRe.exec(text); match; match = boldRe.exec(text)) {
            if (match.index > lastIndex) {
                nodes.push(text.slice(lastIndex, match.index));
            }
            nodes.push(
                <strong key={`b-${match.index}`} className="font-bold">
                    {match[1]}
                </strong>
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            nodes.push(text.slice(lastIndex));
        }

        return nodes;
    }

    // Format message content with basic markdown (safe: no HTML injection)
    const formatMessage = (content: string) => {
        const lines = content.split("\n");
        return (
            <div className="space-y-1">
                {lines.map((rawLine, i) => {
                    if (!rawLine.trim()) return <div key={`l-${i}`} className="h-2" />;

                    const line = rawLine.replace(/\r/g, "");
                    const trimmedStart = line.trimStart();
                    const isBullet = trimmedStart.startsWith("- ");
                    const body = isBullet ? trimmedStart.slice(2) : line;

                    return (
                        <div key={`l-${i}`} className={isBullet ? "flex gap-2" : undefined}>
                            {isBullet ? <span className="text-amber-500">•</span> : null}
                            <span>{renderInlineMarkdown(body)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {/* Floating Button - Desktop Only */}
            <div className="fixed bottom-6 right-6 z-50 hidden lg:flex flex-col items-end gap-3">
                {/* Tooltip hint */}
                {!open && (
                    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-2 shadow-xl animate-in fade-in slide-in-from-right-2 duration-500">
                        <div className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">Assistente IA</span>
                            <Badge variant="secondary" className="text-[10px] font-bold">
                                Ctrl+J
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Main Button */}
                <Button
                    onClick={() => setOpen(true)}
                    className={cn(
                        "h-16 w-16 rounded-full shadow-2xl relative overflow-hidden group",
                        "bg-card/90 backdrop-blur-sm border border-border",
                        "transition-all duration-300 hover:scale-110 hover:shadow-xl",
                        "hover:bg-card"
                    )}
                >
                    {/* Logo */}
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                        {logoError ? (
                            <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <Image
                                src="/RitualFin%20Logo.png"
                                alt="RitualFin"
                                width={48}
                                height={48}
                                className="object-contain"
                                onError={() => setLogoError(true)}
                            />
                        )}
                    </div>
                </Button>
            </div>

            {/* Chat Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col bg-gradient-to-b from-card to-background border-l border-border">
                    {/* Header */}
                    <SheetHeader className="p-6 border-b border-border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
	                                <div className="w-14 h-14 rounded-2xl bg-transparent border border-border/50 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-amber-500/20">
	                                    <Image
	                                        src="/RitualFin%20Logo.png"
	                                        alt="RitualFin"
	                                        width={48}
	                                        height={48}
	                                        className="object-contain drop-shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
	                                </div>
                                <div>
                                    <SheetTitle className="font-display text-2xl tracking-tight flex items-center gap-2">
                                        Analista Ritual
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                    </SheetTitle>
                                    <SheetDescription className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Inteligência Financeira
                                    </SheetDescription>
                                </div>
                            </div>

                            {/* Clear Chat Button */}
                            {messages.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearChat}
                                    className="rounded-xl text-muted-foreground hover:text-destructive"
                                    title="Limpar conversa"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Context Badge */}
                        <div className="flex items-center gap-2 mt-4">
                            <Badge variant="secondary" className="rounded-xl text-xs font-bold">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {SCREEN_LABELS[currentScreen]}
                            </Badge>
                            <Badge variant="outline" className="rounded-xl text-xs">
                                {messages.length - 1} mensagens
                            </Badge>
                        </div>
                    </SheetHeader>

                    {/* Quick Actions */}
                    {showSuggestions && messages.length <= 1 && (
                        <div className="px-6 py-4 border-b border-border bg-secondary/30">
                            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Ações Rápidas</span>
                            </div>
                            <div className="flex gap-2">
                                {quickActions.map((action, i) => (
                                    <Button
                                        key={i}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleSend(action.question)}
                                        disabled={isPending}
                                        className="rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                                    >
                                        <action.icon className="h-3.5 w-3.5" />
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="flex flex-col gap-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}>
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white"
                                            : "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50"
                                    )}>
                                        {msg.role === "user" ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Image
                                                src="/RitualFin%20Logo.png"
                                                alt="R"
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm"
                                                : "bg-white dark:bg-secondary/50 border border-border rounded-tl-sm"
                                        )}>
                                            {formatMessage(msg.content)}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] text-muted-foreground px-2",
                                            msg.role === "user" ? "text-right" : "text-left"
                                        )} suppressHydrationWarning>
                                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Sample Questions */}
                            {showSuggestions && messages.length === 1 && (
                                <div className="mr-auto max-w-[95%]">
                                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                        <Lightbulb className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Perguntas Sugeridas</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {sampleQuestions.map((question, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(question)}
                                                disabled={isPending}
                                                className="group px-4 py-3 text-sm font-medium bg-secondary/50 hover:bg-amber-500/10 rounded-xl border border-border hover:border-amber-500/30 transition-all text-left disabled:opacity-50 flex items-center justify-between"
                                            >
                                                <span>{question}</span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Typing Indicator */}
                            {isPending && (
                                <div className="flex items-start gap-3 mr-auto max-w-[90%] animate-in fade-in duration-300">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 flex items-center justify-center shrink-0 shadow-sm">
                                        <Image
                                            src="/RitualFin%20Logo.png"
                                            alt="R"
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="p-4 bg-white dark:bg-secondary/50 border border-border rounded-2xl rounded-tl-sm shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                Analisando seus dados...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                        <form
                            className="flex items-center gap-2 bg-secondary p-2 rounded-2xl border-2 border-transparent focus-within:border-amber-500/30 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <Input
                                ref={inputRef}
                                className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 h-12 font-medium text-base"
                                placeholder="Pergunte sobre suas finanças..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isPending}
                            />
                            <Button
                                size="icon"
                                className={cn(
                                    "rounded-xl h-12 w-12 shrink-0 transition-all",
                                    input.trim() && !isPending
                                        ? "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg"
                                        : ""
                                )}
                                type="submit"
                                disabled={!input.trim() || isPending}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                        <div className="flex items-center justify-between mt-3 px-2">
                            <p className="text-[10px] text-muted-foreground">
                                Powered by <span className="font-bold">OpenAI GPT-4</span>
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                                onClick={() => window.location.href = "/settings?tab=assistant"}
                            >
                                <Settings className="h-3 w-3 mr-1" />
                                Configurar
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

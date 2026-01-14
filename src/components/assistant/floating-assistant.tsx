"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User, Loader2, Lightbulb, X, MessageCircle } from "lucide-react";
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

export function FloatingAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Olá! Sou o Analista Ritual, seu assistente financeiro. Posso ajudar a analisar seus gastos, comparar períodos, identificar padrões e muito mais. Como posso ajudar?",
            timestamp: new Date()
        }
    ]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Determine current screen from pathname
    const getCurrentScreen = () => {
        if (pathname.includes("dashboard")) return "dashboard";
        if (pathname.includes("transactions")) return "transactions";
        if (pathname.includes("calendar")) return "calendar";
        if (pathname.includes("analytics")) return "analytics";
        if (pathname.includes("uploads")) return "uploads";
        if (pathname.includes("settings")) return "settings";
        if (pathname.includes("confirm")) return "confirm";
        return "general";
    };

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

    const handleSend = async (messageText?: string) => {
        const userMsg = messageText || input;
        if (!userMsg.trim()) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);

        startTransition(async () => {
            const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const result = await sendChatMessage(userMsg, conversationHistory, getCurrentScreen());

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

    // Get random sample questions (5 at a time)
    const getSampleQuestions = () => {
        const shuffled = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    };

    const [sampleQuestions] = useState(getSampleQuestions);

    return (
        <>
            {/* Floating Button - Desktop Only */}
            <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
                <Button
                    onClick={() => setOpen(true)}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl",
                        "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                        "transition-all duration-300 hover:scale-110",
                        "ring-4 ring-amber-500/20 hover:ring-amber-500/40"
                    )}
                >
                    <Sparkles className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Chat Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card border-l border-border">
                    <SheetHeader className="p-6 border-b border-border bg-secondary/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    <Image
                                        src="/logo-ritualfin-wax-seal.png"
                                        alt="RitualFin"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <SheetTitle className="font-display text-xl">Analista Ritual</SheetTitle>
                                    <SheetDescription className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                                        Inteligência Financeira
                                    </SheetDescription>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 p-6">
                        <div className="flex flex-col gap-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-3 max-w-[85%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "user" ? "bg-slate-900 text-white" : "bg-amber-100"
                                    )}>
                                        {msg.role === "user" ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Image
                                                src="/logo-ritualfin-wax-seal.png"
                                                alt="R"
                                                width={20}
                                                height={20}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm font-medium shadow-sm",
                                        msg.role === "user"
                                            ? "bg-slate-900 text-white rounded-tr-none"
                                            : "bg-white dark:bg-secondary/50 border border-border rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Sample Questions */}
                            {showSuggestions && messages.length === 1 && (
                                <div className="mr-auto max-w-[90%]">
                                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                        <Lightbulb className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Sugestões</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sampleQuestions.map((question, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(question)}
                                                disabled={isPending}
                                                className="px-3 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-full border border-border transition-colors text-left disabled:opacity-50"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isPending && (
                                <div className="flex items-start gap-3 mr-auto max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <Image
                                            src="/logo-ritualfin-wax-seal.png"
                                            alt="R"
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="p-4 bg-white dark:bg-secondary/50 border border-border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Analisando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border bg-background">
                        <form
                            className="flex items-center gap-2 bg-secondary p-2 rounded-2xl border-2 border-transparent focus-within:border-primary/20 transition-all"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <Input
                                className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 h-10 font-medium"
                                placeholder="Faça uma pergunta sobre suas finanças..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isPending}
                            />
                            <Button size="icon" className="rounded-xl h-10 w-10 shrink-0" type="submit" disabled={!input.trim() || isPending}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            Powered by OpenAI GPT-4 • Seus dados são privados
                        </p>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

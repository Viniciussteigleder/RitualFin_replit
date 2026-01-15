"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User, Loader2, MessageCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/actions/ai-chat";
import { SAMPLE_QUESTIONS } from "@/lib/constants/ai-questions";
import Image from "next/image";

type Message = {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

interface AIAnalystChatProps {
    currentScreen?: string;
}

export function AIAnalystChat({ currentScreen = "transactions" }: AIAnalystChatProps) {
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

    // Get random sample questions (5 at a time)
    const getSampleQuestions = () => {
        const shuffled = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    };

    const [sampleQuestions] = useState(getSampleQuestions);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="h-14 lg:h-auto gap-4 bg-secondary/50 p-4 rounded-3xl border border-border backdrop-blur-sm shadow-sm px-6 hover:bg-secondary cursor-pointer transition-all group">
                   <div className="flex flex-col items-end mr-2">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Analista IA</span>
                     <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Perguntar</span>
                   </div>
                   <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-background group-hover:scale-110 transition-transform"><Sparkles className="h-4 w-4 text-emerald-500" /></div>
                   </div>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col bg-card border-l border-border shadow-2xl">
                <SheetHeader className="p-6 border-b border-border bg-secondary/20">
                    <div className="flex items-center gap-4">
	                        <div className="w-12 h-12 rounded-2xl bg-transparent border border-border/50 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20 relative">
	                            <Image
	                                src="/RitualFin%20Logo.png"
	                                alt="RitualFin"
	                                fill
	                                sizes="48px"
	                                className="object-contain p-2"
	                                priority
	                            />
	                        </div>
                        <div className="flex flex-col text-left">
                            <SheetTitle className="font-display text-xl font-bold tracking-tight">Analista Ritual</SheetTitle>
                            <SheetDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Inteligência Financeira</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="flex flex-col gap-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-3 max-w-[90%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative border",
                                msg.role === "user" ? "bg-slate-900 border-slate-700" : "bg-transparent border-border/50"
                                )}>
                                    {msg.role === "user" ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Image
                                            src="/RitualFin%20Logo.png"
                                            alt="R"
                                            fill
                                            sizes="32px"
                                            className="object-contain p-1"
                                        />
                                    )}
                                </div>
                                <div className={cn(
                                    "p-5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed whitespace-pre-wrap",
                                    msg.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-none border border-slate-800"
                                        : "bg-white dark:bg-secondary/30 border border-border rounded-tl-none text-foreground/90"
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
                                        src="/RitualFin%20Logo.png"
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
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

export function AIAnalystChat() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Olá! Sou seu Analista Financeiro via IA. Como posso ajudar a analisar seus gastos hoje?",
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
        setIsLoading(true);

        // Simulate AI response for now (to be connected to real backend later)
        setTimeout(() => {
            let response = "Interessante. Baseado nos seus dados, parece que você está seguindo o planejado. Posso analisar mais a fundo se quiser.";
            if (userMsg.toLowerCase().includes("gastei") && userMsg.toLowerCase().includes("mercado")) {
                response = "Você gastou cerca de €450 em Mercado este mês, o que está 10% acima da sua média habitual.";
            } else if (userMsg.toLowerCase().includes("economia")) {
                response = "Identifiquei oportunidades de economia em 'Assinaturas' e 'Lazer'.";
            }

            setMessages(prev => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
            setIsLoading(false);
        }, 1500);
    };

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
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card border-l border-border">
                <SheetHeader className="p-6 border-b border-border bg-secondary/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <SheetTitle className="font-display text-xl">Analista Ritual</SheetTitle>
                            <SheetDescription className="text-xs font-bold uppercase tracking-widest">Inteligência Financeira</SheetDescription>
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
                                    msg.role === "user" ? "bg-slate-900 text-white" : "bg-primary/10 text-primary"
                                )}>
                                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
                        {isLoading && (
                            <div className="flex items-start gap-3 mr-auto max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Bot className="h-4 w-4" />
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
                        />
                        <Button size="icon" className="rounded-xl h-10 w-10 shrink-0" type="submit" disabled={!input.trim() || isLoading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

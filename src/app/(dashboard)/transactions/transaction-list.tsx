"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle, 
    DrawerDescription,
    DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Search, 
    Calendar, 
    CreditCard, 
    Tag, 
    Info, 
    CheckCircle2, 
    AlertCircle,
    FileText,
    ExternalLink,
    Brain
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function TransactionList({ transactions }: { transactions: any[] }) {
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [search, setSearch] = useState("");

    const filtered = transactions.filter(tx => 
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category1?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search transactions..." 
                    className="pl-10 h-10 bg-white border-slate-200 focus:ring-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card className="border-slate-200 overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50/50">
                                <div className="p-4 bg-white rounded-full w-12 h-12 mx-auto mb-4 border border-slate-100 flex items-center justify-center">
                                    <Search className="h-6 w-6 text-slate-300" />
                                </div>
                                <h3 className="font-semibold text-slate-900">No transactions found</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">
                                    Try adjusting your search or import new data.
                                </p>
                            </div>
                        ) : (
                            filtered.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-all group"
                                    onClick={() => setSelectedTx(tx)}
                                >
                                    <div className="flex gap-4 items-center min-w-0">
                                        <div className={`shrink-0 p-2 rounded-xl transition-all ${tx.amount < 0 ? "bg-rose-50 text-rose-600 group-hover:scale-110" : "bg-emerald-50 text-emerald-600 group-hover:scale-110"}`}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                                {tx.description}
                                                {tx.needsReview && (
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 fill-amber-50" />
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-slate-200">•</span>
                                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600 border-none font-bold tracking-tight uppercase">{tx.accountSource}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-0.5 shrink-0">
                                        <div className={`font-mono font-bold tracking-tighter ${tx.amount < 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                            {tx.amount > 0 ? "+" : ""}{new Intl.NumberFormat("de-DE", {
                                                style: "currency",
                                                currency: "EUR",
                                            }).format(tx.amount)}
                                        </div>
                                        {tx.category1 && (
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                {tx.category1}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Drawer open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DrawerContent className="bg-slate-50 border-t-0 p-0 overflow-hidden rounded-t-[32px]">
                    {selectedTx && (
                        <div className="mx-auto w-full max-w-3xl flex flex-col h-[85vh]">
                            <div className="bg-white border-b px-8 py-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="space-y-1">
                                        <DrawerTitle className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">{selectedTx.description}</DrawerTitle>
                                        <DrawerDescription className="text-slate-500 flex items-center gap-2 font-medium text-base">
                                            <Calendar className="h-4 w-4" /> {new Date(selectedTx.date).toLocaleDateString()}
                                            <span className="text-slate-300">•</span>
                                            <CreditCard className="h-4 w-4 ml-1" /> {selectedTx.accountSource}
                                        </DrawerDescription>
                                    </div>
                                    <div className="text-4xl font-mono font-bold tracking-tighter text-slate-900">
                                         {new Intl.NumberFormat("de-DE", {
                                            style: "currency",
                                            currency: "EUR",
                                        }).format(selectedTx.amount)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {selectedTx.category1 || "Unclassified"}
                                    </Badge>
                                    <Badge variant="outline" className="text-slate-500 border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {selectedTx.fixVar || "Variável"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-8 space-y-10 overflow-y-auto flex-1">
                                {/* Classification Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Tag className="h-4 w-4" /> Intelligence & Context
                                        </h3>
                                    </div>
                                    
                                    {selectedTx.rule ? (
                                        <div className="flex items-start gap-4 p-5 bg-indigo-50/50 text-indigo-900 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-50">
                                            <div className="shrink-0 p-2.5 bg-indigo-100 rounded-xl">
                                                <Brain className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold tracking-tight">Matched Rule: {selectedTx.rule.name}</div>
                                                <div className="text-xs text-indigo-700/80 leading-relaxed">
                                                    Applied based on keyword: <span className="bg-indigo-100/80 px-1.5 py-0.5 rounded-md font-mono font-bold">{selectedTx.rule.keywords || selectedTx.rule.keyWords}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4 p-5 bg-slate-100/50 text-slate-600 rounded-2xl border border-dashed border-slate-200">
                                            <div className="shrink-0 p-2.5 bg-slate-200/50 rounded-xl">
                                                <Info className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold tracking-tight">Manual Decision</div>
                                                <div className="text-xs text-slate-500 leading-relaxed">
                                                    No automated rule matched this transaction. Consider creating a rule for future automation.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>


                                {/* Evidence Section */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Audit Evidence
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedTx.evidenceLinks?.length > 0 ? (
                                            selectedTx.evidenceLinks.map((link: any, i: number) => (
                                                <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                            Source Record #{i + 1}
                                                            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-500 border-none font-bold text-[10px]">{link.ingestionItem?.source}</Badge>
                                                        </div>
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px]">VERIFIED</Badge>
                                                    </div>
                                                    <div className="text-[11px] font-mono bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-inner">
                                                        {JSON.stringify(link.ingestionItem?.parsedPayload || link.ingestionItem?.rawPayload, null, 2)}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center">
                                                <FileText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm text-slate-400 font-medium">No external evidence linked to this transaction.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <DrawerFooter className="flex-row gap-4 p-8 bg-white border-t">
                                <Button className="flex-1 h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold tracking-tight transition-all active:scale-95 shadow-lg shadow-slate-200">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Close
                                </Button>
                                <Button variant="ghost" className="flex-1 h-12 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold tracking-tight" onClick={() => setSelectedTx(null)}>
                                    Dismiss
                                </Button>
                            </DrawerFooter>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>

        </div>
    );
}

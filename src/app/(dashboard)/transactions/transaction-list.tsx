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
    ExternalLink
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
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search transactions..." 
                    className="pl-10 h-11"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions matching your search.
                            </div>
                        ) : (
                            filtered.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setSelectedTx(tx)}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className={`p-2 rounded-full ${tx.amount < 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-semibold flex items-center gap-2">
                                                {tx.description}
                                                {tx.needsReview && (
                                                    <AlertCircle className="h-3 w-3 text-amber-500" />
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(tx.date).toLocaleDateString()}
                                                <span>•</span>
                                                <Badge variant="secondary" className="text-[10px] py-0">{tx.accountSource}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className={`font-bold ${tx.amount < 0 ? "" : "text-green-600"}`}>
                                            {new Intl.NumberFormat("de-DE", {
                                                style: "currency",
                                                currency: "EUR",
                                            }).format(tx.amount)}
                                        </div>
                                        {tx.category1 && (
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
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
                <DrawerContent>
                    {selectedTx && (
                        <div className="mx-auto w-full max-w-2xl">
                            <DrawerHeader className="border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <DrawerTitle className="text-2xl">{selectedTx.description}</DrawerTitle>
                                        <DrawerDescription>
                                            {new Date(selectedTx.date).toLocaleDateString()} at {selectedTx.accountSource}
                                        </DrawerDescription>
                                    </div>
                                    <div className="text-2xl font-bold">
                                         {new Intl.NumberFormat("de-DE", {
                                            style: "currency",
                                            currency: "EUR",
                                        }).format(selectedTx.amount)}
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="p-6 space-y-8">
                                {/* Classification Section */}
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <Tag className="h-4 w-4" /> CLASSIFICATION
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Category</div>
                                            <div className="font-medium">{selectedTx.category1 || "Unclassified"}</div>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                                            <div className="text-[10px] uppercase text-muted-foreground">Type</div>
                                            <div className="font-medium text-amber-600">{selectedTx.fixVar || "Variável"}</div>
                                        </div>
                                    </div>
                                    
                                    {selectedTx.rule && (
                                        <div className="flex items-start gap-3 p-4 bg-blue-50/50 text-blue-900 rounded-xl border border-blue-100">
                                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold">Matched Rule: {selectedTx.rule.name}</div>
                                                <div className="text-xs opacity-80">
                                                    Keyword match: <code className="bg-blue-100 px-1 rounded">{selectedTx.rule.keywords || selectedTx.rule.keyWords}</code>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Evidence Section */}
                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> EVIDENCE
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedTx.evidenceLinks?.map((link: any, i: number) => (
                                            <div key={i} className="p-4 border rounded-xl space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                        Source Record #{i + 1} ({link.ingestionItem?.source})
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px]">VERIFIED</Badge>
                                                </div>
                                                <div className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto whitespace-pre">
                                                    {JSON.stringify(link.ingestionItem?.parsedPayload || link.ingestionItem?.rawPayload, null, 2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <DrawerFooter className="flex-row gap-3 border-t">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedTx(null)}>
                                    Close
                                </Button>
                            </DrawerFooter>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}

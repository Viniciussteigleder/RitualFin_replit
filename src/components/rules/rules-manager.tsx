"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { 
    Search,
    Download,
    Upload,
    Zap,
    ChevronRight,
    Edit2,
    Trash2,
    X,
    Save,
    Sparkles,
    Braces,
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateRule, deleteRule, upsertRules } from "@/lib/actions/rules";
import { cn } from "@/lib/utils";

// Categories matching app (should be imported ideally, but hardcoding for speed/consistency with other files)
const CATEGORIES = [
  "Receitas", "Moradia", "Mercados", "Compras Online",
  "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
  "Tecnologia", "Alimentação", "Energia", "Internet",
  "Educação", "Presentes", "Streaming", "Academia",
  "Investimentos", "Outros", "Interno", "Assinaturas", "Compras",
  "Doações", "Esportes", "Finanças", "Férias", "Mobilidade",
  "Pets", "Telefone", "Trabalho", "Transferências", "Vendas"
];

export function RulesManager({ initialRules }: { initialRules: any[] }) {
    const [rules, setRules] = useState(initialRules);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    
    // Edit State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter Logic
    const filteredRules = rules.filter(rule => {
        const matchesSearch = 
            (rule.keyWords || "").toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = categoryFilter === "ALL" || rule.category1 === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Excel Export
    const handleExport = () => {
        try {
            const dataToExport = rules.map(r => ({
                ID: r.id, // Important for updates
                // Name: r.name, // Removed
                Keywords: r.keyWords,
                Category1: r.category1,
                Category2: r.category2,
                Priority: r.priority,
                Active: r.active,
                // RuleKey: r.ruleKey // Removed
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Regras");
            XLSX.writeFile(wb, "RitualFin_Regras.xlsx");
            toast.success("Download iniciado");
        } catch (error) {
            toast.error("Erro ao exportar excel");
        }
    };

    // Excel Import
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error("Arquivo vazio");
                    return;
                }

                toast.info(`Processando ${data.length} regras...`);
                setIsLoading(true);

                // Call Server Action
                const result = await upsertRules(data);
                
                if (result.success) {
                    toast.success(`${result.count} regras importadas/atualizadas!`);
                    // Refresh not strictly needed if we reload page, but let's try to update state?
                    // Ideally we fetch fresh rules, but a reload is simpler for user
                    window.location.reload(); 
                } else {
                    toast.error("Erro na importação: " + result.error);
                }
            } catch (error) {
                console.error(error);
                toast.error("Erro ao ler arquivo excel");
            } finally {
                setIsLoading(false);
                // Reset input
                e.target.value = ""; 
            }
        };
        reader.readAsBinaryString(file);
    };

    // Edit Handling
    const openEdit = (rule: any) => {
        setEditingRule({ ...rule });
        setIsSheetOpen(true);
    };

    const handleSave = async () => {
        if (!editingRule) return;
        setIsLoading(true);
        try {
            const result = await updateRule(editingRule.id, {
                // name: editingRule.name, // Removed
                keyWords: editingRule.keyWords,
                category1: editingRule.category1,
                category2: editingRule.category2,
                priority: parseInt(editingRule.priority),
                active: editingRule.active
            });

            if (result.success) {
                toast.success("Regra atualizada");
                // Update local state optimistic
                setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
                setIsSheetOpen(false);
            } else {
                toast.error("Erro ao salvar: " + result.error);
            }
        } catch (error) {
            toast.error("Erro inesperado");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(!confirm("Tem certeza que deseja excluir esta regra?")) return;
        
        const result = await deleteRule(id);
        if (result.success) {
            toast.success("Regra excluída");
            setRules(prev => prev.filter(r => r.id !== id));
        } else {
            toast.error("Erro ao excluir");
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Pesquisar regras..." 
                        className="pl-10 h-12 bg-secondary/50 border-none rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                     <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl bg-secondary/50 border-none">
                         <SelectValue placeholder="Categoria" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="ALL">Todas Categorias</SelectItem>
                         {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                     </SelectContent>
                </Select>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="h-12 rounded-xl gap-2 flex-1 md:flex-none border-border" onClick={handleExport}>
                        <Download className="h-4 w-4" /> Exportar
                    </Button>
                    <div className="relative flex-1 md:flex-none">
                        <Button variant="outline" className="h-12 rounded-xl gap-2 w-full border-border cursor-pointer relative overflow-hidden">
                            <Upload className="h-4 w-4" /> Importar
                            <input 
                                type="file" 
                                accept=".xlsx, .xls"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImport}
                                disabled={isLoading}
                            />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Neural Links / Rules Grid */}
            <div className="flex items-center gap-2 px-1 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-bold text-foreground font-display tracking-tight">Conexões Neurais</h2>
                <Badge variant="outline" className="ml-2 border-border text-[10px] font-black uppercase text-muted-foreground">{filteredRules.length} Regras</Badge>
            </div>

            <div className="grid gap-6">
                {filteredRules.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center">
                            <Braces className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">Nenhuma conexão neural encontrada para os filtros.</p>
                        <Button variant="outline" className="rounded-xl" onClick={() => { setSearch(""); setCategoryFilter("ALL"); }}>Limpar Filtros</Button>
                    </div>
                )}

                {filteredRules.map(rule => (
                    <div key={rule.id} className="group relative bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-[border-color,box-shadow,background-color,color,opacity] duration-200 flex flex-col xl:flex-row gap-8 items-start xl:items-center overflow-hidden">
                        {/* Status bar on the side */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5 transition-[background-color,box-shadow,opacity] duration-200",
                            rule.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-neutral-500"
                        )} />

                        {/* Connection Visualizer */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 w-full">
                            <div className="flex flex-col items-center sm:items-start gap-1 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Braces className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Input Layer</span>
                                </div>
                                <h3 className="font-bold text-xl text-foreground font-display tracking-tight mt-1 max-w-[300px] truncate">
                                    {rule.keyWords}
                                </h3>
                            </div>

                            {/* The "Neural Flow" Arrow */}
                            <div className="hidden sm:flex flex-1 items-center px-4 relative">
                                <div className="h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 w-full relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 py-1 border border-border rounded-full flex items-center gap-1.5 shadow-sm">
                                        <Zap className="h-3 w-3 text-amber-500" />
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">P:{rule.priority}</span>
                                    </div>
                                    {/* Pulsing Dot */}
                                    {rule.active && (
                                        <div className="absolute top-1/2 left-0 h-1 w-1 bg-primary rounded-full -translate-y-1/2 animate-neural-pulse-infinite" style={{ left: '0%' }} />
                                    )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-primary/50 -ml-1" />
                            </div>

                            <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Output Class</span>
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="bg-secondary/50 text-foreground font-bold rounded-lg px-3 py-1 text-sm border-none">
                                        {rule.category1}
                                    </Badge>
                                    {rule.category2 && (
                                         <Badge variant="outline" className="border-border text-muted-foreground font-medium rounded-lg px-2 py-0.5 text-[10px] uppercase">
                                            {rule.category2}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-border/50">
                             <div className="xl:hidden flex-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Priority: {rule.priority}
                             </div>
                             
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                className="rounded-xl h-11 px-5 font-bold gap-2 text-xs bg-secondary hover:bg-secondary/70 border border-border/50 transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 hover:scale-105 active:scale-95" 
                                onClick={() => openEdit(rule)}
                             >
                                <Edit2 className="h-3.5 w-3.5" /> Ajustar
                             </Button>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-11 w-11 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/5 transition-[background-color,color,opacity] duration-150" 
                                onClick={() => handleDelete(rule.id)}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md rounded-l-3xl border-l border-border bg-card p-0 shadow-2xl">
                    <div className="h-full flex flex-col overflow-y-auto">
                        <SheetHeader className="p-6 border-b border-border">
                            <SheetTitle className="text-2xl font-bold font-display">Editar Regra</SheetTitle>
                            <SheetDescription>Ajuste os critérios de classificação.</SheetDescription>
                        </SheetHeader>

                        {editingRule && (
                            <div className="p-6 space-y-6 flex-1">
                                {/* Name input removed */}
                                {/*
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome da Regra</label>
                                    <Input 
                                        value={editingRule.name} 
                                        onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                                        className="bg-secondary/50 border-none h-12"
                                    />
                                </div>
                                */}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Palavras-Chave (Matches)</label>
                                    <Input 
                                        value={editingRule.keyWords} 
                                        onChange={(e) => setEditingRule({...editingRule, keyWords: e.target.value.toUpperCase()})}
                                        className="bg-secondary/50 border-none h-12 font-mono uppercase"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Use termos únicos da transação.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoria Principal</label>
                                    <Select 
                                        value={editingRule.category1} 
                                        onValueChange={(val) => setEditingRule({...editingRule, category1: val})}
                                    >
                                        <SelectTrigger className="w-full h-12 bg-secondary/50 border-none">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prioridade (Maior = Primeiro)</label>
                                    <Input 
                                        type="number"
                                        value={editingRule.priority} 
                                        onChange={(e) => setEditingRule({...editingRule, priority: e.target.value})}
                                        className="bg-secondary/50 border-none h-12"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                                    <span className="font-bold text-sm">Regra Ativa?</span>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant={editingRule.active ? "default" : "outline"} 
                                            onClick={() => setEditingRule({...editingRule, active: true})}
                                            className={editingRule.active ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-border"}
                                        >
                                            Sim
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={!editingRule.active ? "destructive" : "outline"}
                                            onClick={() => setEditingRule({...editingRule, active: false})}
                                            className={!editingRule.active ? "bg-destructive border-none" : "border-border"}
                                        >
                                            Não
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <SheetFooter className="p-6 border-t border-border mt-auto">
                            <SheetClose asChild>
                                <Button variant="outline" className="h-12 w-full rounded-xl border-border">Cancelar</Button>
                            </SheetClose>
                            <Button className="h-12 w-full rounded-xl gap-2 font-bold" onClick={handleSave} disabled={isLoading}>
                                <Save className="h-4 w-4" />
                                {isLoading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

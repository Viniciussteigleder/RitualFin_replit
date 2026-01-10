"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { 
    Search, 
    Download, 
    Upload, 
    Plus, 
    Edit2, 
    Trash2, 
    Zap, 
    Tag, 
    ChevronRight, 
    MoreVertical, 
    Filter,
    X,
    Save
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
  "Receitas", "Moradia", "Mercado", "Compras Online",
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
            (rule.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (rule.keywords || "").toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = categoryFilter === "ALL" || rule.category1 === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Excel Export
    const handleExport = () => {
        try {
            const dataToExport = rules.map(r => ({
                ID: r.id, // Important for updates
                Name: r.name,
                Keywords: r.keywords,
                Category1: r.category1,
                Category2: r.category2,
                Priority: r.priority,
                Active: r.active,
                RuleKey: r.ruleKey
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
                name: editingRule.name,
                keywords: editingRule.keywords,
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

            {/* Rules Grid */}
            <div className="grid gap-4">
                {filteredRules.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        Nenhuma regra encontrada para os filtros.
                    </div>
                )}

                {filteredRules.map(rule => (
                    <div key={rule.id} className="group relative bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                            <Zap className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-lg text-foreground">{rule.name}</h3>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="rounded-lg font-mono tracking-wide">{rule.keywords}</Badge>
                                <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                    <Tag className="h-3 w-3" /> {rule.category1}
                                </span>
                                {rule.category2 && (
                                     <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-lg">
                                        <ChevronRight className="h-3 w-3" /> {rule.category2}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:ml-auto w-full md:w-auto">
                             <Badge className={cn(
                                "mr-auto md:mr-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                                rule.active ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-500/10 text-neutral-500"
                             )}>
                                {rule.active ? "Ativa" : "Inativa"}
                             </Badge>
                             
                             <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" onClick={() => openEdit(rule)}>
                                <Edit2 className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl" onClick={() => handleDelete(rule.id)}>
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome da Regra</label>
                                    <Input 
                                        value={editingRule.name} 
                                        onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                                        className="bg-secondary/50 border-none h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Palavras-Chave (Keywords)</label>
                                    <Input 
                                        value={editingRule.keywords} 
                                        onChange={(e) => setEditingRule({...editingRule, keywords: e.target.value.toUpperCase()})}
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

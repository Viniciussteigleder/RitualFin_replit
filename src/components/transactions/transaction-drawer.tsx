"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, 
    Trash2, 
    Save, 
    X, 
    Loader2, 
    TrendingUp, 
    TrendingDown,
    Repeat,
    Search,
    ChevronRight,
    Ban,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { updateTransactionDetails } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryConfig } from "@/lib/constants/categories";
import { TaxonomyOption } from "@/lib/actions/discovery";

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onUpdate?: (transaction: any) => void; // Optional callback for local state update
  onConfirm?: (id: string, updates: any) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  onLeafChange?: (id: string, leafId: string) => Promise<any>;
  appCategories: string[];
  categories1: string[];
  categories2: string[];
  categories3: string[];
  taxonomyOptions?: TaxonomyOption[];
}

export function TransactionDrawer({
  open,
  onOpenChange,
  transaction,
  onUpdate,
  onConfirm,
  onDelete,
  onLeafChange,
  taxonomyOptions = []
}: TransactionDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [categorySearch, setCategorySearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    type: "Despesa",
    fixVar: "Variável",
    recurring: false,
    appCategory: "",
    category1: "",
    category2: "",
    category3: "",
    leafId: "",
  });

  // Derived state for keywords (visual only for now, mapped to description if needed in future)
  // For this component, we focus on the categorization and properties. 
  // We can show the description as "Keywords" context.

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || (transaction.amount > 0 ? "Receita" : "Despesa"),
        fixVar: transaction.fixVar || "Variável",
        recurring: transaction.recurring || false,
        appCategory: transaction.appCategory || "Outros",
        category1: transaction.category1 || "Outros",
        category2: transaction.category2 || "",
        category3: transaction.category3 || "",
        leafId: transaction.leafId || "",
      });
      setCategorySearch("");
    }
  }, [transaction]);

  // Filter taxonomy options
  const filteredOptions = useMemo(() => {
    if (!categorySearch) return taxonomyOptions;
    const search = categorySearch.toLowerCase();
    return taxonomyOptions.filter(opt =>
      opt.label.toLowerCase().includes(search) ||
      opt.category1.toLowerCase().includes(search) ||
      (opt.category2 && opt.category2.toLowerCase().includes(search)) ||
      (opt.category3 && opt.category3.toLowerCase().includes(search))
    );
  }, [taxonomyOptions, categorySearch]);

  const selectedOption = taxonomyOptions.find(o => o.leafId === formData.leafId);

  const handleSave = () => {
    if (!transaction) return;
    
    startTransition(async () => {
      try {
        const result = await updateTransactionDetails(transaction.id, {
          transactionId: transaction.id,
          type: formData.type as any,
          fixVar: formData.fixVar as any,
          recurring: formData.recurring,
          appCategory: formData.appCategory,
          category1: formData.category1,
          category2: formData.category2,
          category3: formData.category3,
          leafId: formData.leafId, // Include leafId for precision
        });

        if (result.success) {
          toast.success("Transação atualizada!");
          onOpenChange(false);
          // If onConfirm is passed (like on confirm page), call it to confirm the transaction
          if (onConfirm) {
             await onConfirm(transaction.id, {});
          }
          if (onUpdate) {
            onUpdate({ ...transaction, ...formData });
          }
        } else {
          toast.error("Erro ao atualizar", { description: result.error });
        }
      } catch (error) {
        toast.error("Erro inesperado ao salvar");
      }
    });
  };

  const handleCategorySelect = (opt: TaxonomyOption) => {
    setFormData(prev => ({
      ...prev,
      leafId: opt.leafId,
      appCategory: opt.appCategory,
      category1: opt.category1,
      category2: opt.category2 || "",
      category3: opt.category3 || "",
      // Auto-switch type based on category heuristic
      type: (opt.category1 === "Renda Extra" || opt.category1 === "Trabalho" || opt.category1.toLowerCase().includes("receita")) 
            ? "Receita" 
            : prev.type
    }));
    setCategorySearch("");
  };

  if (!transaction) return null;

  const amount = transaction.amount || 0;
  // Handle various date formats (string or Date object)
  const dateObj = transaction.date ? new Date(transaction.date) : (transaction.paymentDate ? new Date(transaction.paymentDate) : new Date());
  const dateLabel = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString("pt-BR") : "Data desconhecida";
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] p-0 gap-0 bg-background overflow-hidden flex flex-col">
          <SheetHeader className="p-6 pb-2 border-b border-border/50">
            <div className="flex items-start justify-between">
                <div className="space-y-1 pr-8">
                    <SheetTitle className="text-xl font-bold font-display break-words">{transaction.descNorm || transaction.descRaw}</SheetTitle>
                    <SheetDescription className="font-mono text-xs">
                        {transaction.id} • {transaction.source || "Conta não identificada"}
                    </SheetDescription>
                </div>
                <div className="text-right shrink-0">
                    <div className={cn("text-2xl font-bold tracking-tight", amount < 0 ? "text-red-600" : "text-emerald-600")}>
                        {formatCurrency(amount)}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                         {dateLabel}
                    </div>
                </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Left Column: Properties */}
                 <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Propriedades
                        </h4>
                        
                        {/* Type Toggle */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Fluxo</label>
                            <div className="flex rounded-xl border border-border overflow-hidden p-1 bg-secondary/30">
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, type: "Despesa" }))}
                                    className={cn(
                                    "flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                    formData.type === "Despesa"
                                        ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm"
                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    <TrendingDown className="w-4 h-4" /> Despesa
                                </button>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, type: "Receita" }))}
                                    className={cn(
                                    "flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                    formData.type === "Receita"
                                        ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm"
                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    <TrendingUp className="w-4 h-4" /> Receita
                                </button>
                            </div>
                        </div>

                         {/* Frequency Toggle */}
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Frequência</label>
                            <div className="flex rounded-xl border border-border overflow-hidden p-1 bg-secondary/30">
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, fixVar: "Variável", recurring: false }))}
                                    className={cn(
                                    "flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                    formData.fixVar === "Variável" && !formData.recurring
                                        ? "bg-white dark:bg-zinc-800 text-amber-600 shadow-sm"
                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    <Calendar className="w-4 h-4" /> Variável
                                </button>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, fixVar: "Fixo", recurring: true }))}
                                    className={cn(
                                    "flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                    formData.fixVar === "Fixo" || formData.recurring
                                        ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm"
                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    <Repeat className="w-4 h-4" /> Recorrente
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/50 w-full" />

                    {/* Metadata Context */}
                    <div className="space-y-2">
                         <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Search className="w-4 h-4" /> Contexto IA
                        </h4>
                        <div className="bg-secondary/30 rounded-xl p-4 space-y-3 border border-border/50">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Descrição Original</span>
                                <p className="font-mono text-xs text-foreground bg-background/50 p-2 rounded-lg break-words">{transaction.descRaw}</p>
                            </div>
                            {transaction.aliasDesc && (
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Alias</span>
                                    <p className="font-mono text-xs text-foreground bg-background/50 p-2 rounded-lg">{transaction.aliasDesc}</p>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            As alterações feitas aqui atualizarão apenas esta transação. Para criar regras automáticas, use a aba "Regras" no Discovery.
                        </p>
                    </div>
                 </div>

                 {/* Right Column: Categorization */}
                 <div className="space-y-4 flex flex-col h-full bg-background/50">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> Classificação
                    </h4>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar categoria (ex: Uber, Mercado)..." 
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="pl-9 h-11 rounded-xl bg-secondary/20 border-border focus:ring-violet-500/20"
                        />
                    </div>

                    {/* Current Selection Display */}
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800/30">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                            <span className="font-black text-violet-700 dark:text-violet-300">
                            {formData.appCategory || "App"}
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span>{formData.category1 || "..."}</span>
                            {formData.category2 && (
                            <>
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{formData.category2}</span>
                            </>
                            )}
                            {formData.category3 && (
                            <>
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{formData.category3}</span>
                            </>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 border border-border rounded-xl bg-background overflow-hidden flex flex-col min-h-[300px] shadow-sm">
                        <div className="overflow-y-auto flex-1 p-0">
                        {filteredOptions.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                                <Search className="w-8 h-8 opacity-20" />
                                <p className="text-sm">Nenhuma categoria encontrada.</p>
                            </div>
                        ) : (
                            filteredOptions.slice(0, 100).map((opt) => {
                                const catConfig = getCategoryConfig(opt.category1);
                                const isSelected = formData.leafId === opt.leafId;
                                return (
                                    <button
                                        key={opt.leafId}
                                        onClick={() => handleCategorySelect(opt)}
                                        className={cn(
                                            "w-full px-4 py-3 text-left text-sm hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 flex items-center gap-3",
                                            isSelected && "bg-violet-50 dark:bg-violet-900/20"
                                        )}
                                    >
                                        <CategoryIcon category={catConfig.name} size="sm" />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className={cn("font-medium truncate", isSelected && "text-violet-700 dark:text-violet-300 font-bold")}>
                                                {opt.label}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {opt.category1} {opt.category2 ? `> ${opt.category2}` : ""}
                                            </span>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-600 ml-auto flex-shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                        </div>
                    </div>
                 </div>
             </div>
          </div>

          <div className="p-6 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
             <div className="flex items-center justify-between gap-4">
                 {onDelete && (
                     <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                        onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta transação?")) {
                                onDelete(transaction.id).then(() => onOpenChange(false));
                            }
                        }}
                        disabled={isPending}
                     >
                         <Trash2 className="w-4 h-4 mr-2" /> Excluir
                     </Button>
                 )}
                 <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
                     <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold flex-1 sm:flex-none">
                         Cancelar
                     </Button>
                     <Button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-8 flex-1 sm:flex-none shadow-lg shadow-primary/20"
                     >
                         {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                         Salvar alterações
                     </Button>
                 </div>
             </div>
          </div>
      </SheetContent>
    </Sheet>
  );
}

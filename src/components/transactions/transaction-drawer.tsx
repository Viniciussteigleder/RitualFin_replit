"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    CheckCircle2,
    Info,
    Bug,
    Wand2,
    Code,
    Receipt,
    Wallet
} from "lucide-react";
import { updateTransactionDetails } from "@/lib/actions/transactions";
import { createRule } from "@/lib/actions/rules";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryConfig } from "@/lib/constants/categories";
import { TaxonomyOption } from "@/lib/actions/discovery";

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onUpdate?: (transaction: any) => void;
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
  const [isRulePending, startRuleTransition] = useTransition();
  const [categorySearch, setCategorySearch] = useState("");
  const [activeTab, setActiveTab] = useState("classification");
  
  // Form State (Transaction)
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

  // Rule State
  const [ruleKeywords, setRuleKeywords] = useState("");
  const [ruleNegativeKeywords, setRuleNegativeKeywords] = useState("");

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
      setRuleKeywords(transaction.descNorm || transaction.descRaw || "");
      setActiveTab("classification");
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
          leafId: formData.leafId,
        });

        if (result.success) {
          toast.success("Transação atualizada!");
          // If onConfirm is passed (like on confirm page), call it to confirm the transaction
          if (onConfirm) {
             await onConfirm(transaction.id, {});
          }
          if (onUpdate) {
            onUpdate({ ...transaction, ...formData });
          }
           // Don't close immediately in full screen mode, let user decide when to leave
           // onOpenChange(false); 
        } else {
          toast.error("Erro ao atualizar", { description: result.error });
        }
      } catch (error) {
        toast.error("Erro inesperado ao salvar");
      }
    });
  };

  const handleCreateRule = () => {
       if (!formData.leafId) {
           toast.error("Selecione uma categoria na aba 'Classificação' primeiro.");
           return;
       }
       startRuleTransition(async () => {
           const res = await createRule({
               keyWords: ruleKeywords,
               keyWordsNegative: ruleNegativeKeywords || undefined,
               category1: formData.category1,
               category2: formData.category2,
               category3: formData.category3,
               leafId: formData.leafId,
               type: formData.type as any,
               fixVar: formData.fixVar as any
           });

           if (res.success) {
               toast.success(res.merged ? "Regra atualizada!" : "Nova regra criada!");
           } else {
               toast.error("Erro ao criar regra", { description: res.error });
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
      type: (opt.category1 === "Renda Extra" || opt.category1 === "Trabalho" || opt.category1.toLowerCase().includes("receita")) 
            ? "Receita" 
            : prev.type
    }));
    setCategorySearch("");
  };

  if (!transaction) return null;

  const amount = transaction.amount || 0;
  const dateObj = transaction.date ? new Date(transaction.date) : (transaction.paymentDate ? new Date(transaction.paymentDate) : new Date());
  const dateLabel = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString("pt-BR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Data desconhecida";
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Full Screen modification: w-screen max-w-none h-screen */}
      <SheetContent side="right" className="w-[100vw] h-[100vh] sm:max-w-none p-0 gap-0 bg-background flex flex-col data-[state=open]:duration-300">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur z-20">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-secondary">
                      <X className="w-5 h-5" />
                  </Button>
                  <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Detalhes da Transação</span>
                      {/* Simple status badge */}
                      {transaction.status === "PENDING" && <Badge variant="outline" className="w-fit text-[10px] mt-0.5 border-amber-200 bg-amber-50 text-amber-700">Pendente</Badge>}
                  </div>
              </div>
              <div className="flex items-center gap-3">
                   <div className="text-right mr-4 hidden sm:block">
                        <div className={cn("text-xl font-bold font-mono tracking-tight", amount < 0 ? "text-red-600" : "text-emerald-600")}>
                            {formatCurrency(amount)}
                        </div>
                   </div>
                   {onDelete && (
                     <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta transação?")) {
                                onDelete(transaction.id).then(() => onOpenChange(false));
                            }
                        }}
                     >
                         <Trash2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Excluir</span>
                     </Button>
                   )}
                   <Button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className="rounded-xl font-bold bg-primary hover:bg-primary/90 min-w-[100px]"
                     >
                         {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                         Salvar
                     </Button>
              </div>
          </div>

          <div className="flex-1 overflow-hidden bg-secondary/10 flex flex-col md:flex-row">
            {/* Main Content Area - Centered max width */}
            <main className="flex-1 w-full max-w-5xl mx-auto h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
                    
                    {/* Tabs Header */}
                    <div className="px-6 pt-6 pb-2">
                         <div className="mb-6 space-y-2">
                             <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight break-words">
                                {transaction.descNorm || transaction.descRaw}
                             </h1>
                             <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                 <Calendar className="w-4 h-4" />
                                 <span className="capitalize">{dateLabel}</span>
                                 <span className="text-border mx-2">|</span>
                                 <Wallet className="w-4 h-4" />
                                 <span>{transaction.source || "Conta não identificada"}</span>
                             </div>
                         </div>
                         
                         <TabsList className="bg-transparent p-0 gap-6 border-b border-border w-full justify-start rounded-none h-auto">
                            <TabsTrigger 
                                value="overview" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-none"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger 
                                value="classification" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-none"
                            >
                                <div className="flex items-center gap-2">
                                    Classificação
                                    <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 pointer-events-none">
                                        Principal
                                    </Badge>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="rules" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-none"
                            >
                                Regras & IA
                            </TabsTrigger>
                            <TabsTrigger 
                                value="debug" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground transition-none"
                            >
                                <div className="flex items-center gap-2">
                                    <Bug className="w-3 h-3" /> Debug
                                </div>
                            </TabsTrigger>
                         </TabsList>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                        {/* TAB: OVERVIEW */}
                        <TabsContent value="overview" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Summary Card */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Resumo</h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <span className="text-xs text-muted-foreground font-medium block mb-1">Valor</span>
                                                <span className={cn("text-2xl font-bold", amount < 0 ? "text-red-600" : "text-emerald-600")}>
                                                    {formatCurrency(amount)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground font-medium block mb-1">Categoria Atual</span>
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon category={getCategoryConfig(formData.category1).name} size="sm" />
                                                    <span className="font-bold">{formData.category1 || "Não classificado"}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                 <span className="text-xs text-muted-foreground font-medium block mb-1">Descrição Original</span>
                                                 <code className="bg-secondary/50 p-3 rounded-lg block text-sm font-mono break-all">
                                                     {transaction.descRaw}
                                                 </code>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Shortcut */}
                                    <div 
                                        onClick={() => setActiveTab("classification")} 
                                        className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/20 rounded-2xl p-6 cursor-pointer hover:border-violet-300 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-violet-100 dark:bg-violet-800 p-2 rounded-xl">
                                                    <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-violet-900 dark:text-violet-100">Classificação e Propriedades</h4>
                                                    <p className="text-sm text-violet-700/80 dark:text-violet-300/80">Editar categoria, tipo e recorrência aqui.</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-4">
                                     <div className="bg-card border border-border rounded-2xl p-5">
                                         <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                             <Info className="w-3 h-3" /> Detalhes Técnicos
                                         </h3>
                                         <div className="space-y-3 text-sm">
                                             <div className="flex justify-between border-b border-border/50 pb-2">
                                                 <span className="text-muted-foreground">ID</span>
                                                 <span className="font-mono text-xs">{transaction.id.slice(0,8)}...</span>
                                             </div>
                                             <div className="flex justify-between border-b border-border/50 pb-2">
                                                 <span className="text-muted-foreground">Conta</span>
                                                 <span>{transaction.source}</span>
                                             </div>
                                             <div className="flex justify-between border-b border-border/50 pb-2">
                                                 <span className="text-muted-foreground">Importado em</span>
                                                 <span>{new Date(transaction.createdAt || Date.now()).toLocaleDateString()}</span>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: CLASSIFICATION (Previous UI logic, refined) */}
                        <TabsContent value="classification" className="space-y-6 mt-0 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                {/* Left: Properties */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" /> Propriedades
                                        </h4>
                                        
                                        {/* Type Toggle */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase">Fluxo</label>
                                            <div className="flex rounded-xl border border-border overflow-hidden p-1 bg-secondary/30">
                                                <button
                                                    onClick={() => setFormData(getHeader => ({ ...getHeader, type: "Despesa" }))}
                                                    className={cn(
                                                    "flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                    formData.type === "Despesa"
                                                        ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm ring-1 ring-black/5"
                                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    <TrendingDown className="w-4 h-4" /> Despesa
                                                </button>
                                                <button
                                                    onClick={() => setFormData(getHeader => ({ ...getHeader, type: "Receita" }))}
                                                    className={cn(
                                                    "flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                    formData.type === "Receita"
                                                        ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm ring-1 ring-black/5"
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
                                                    onClick={() => setFormData(getHeader => ({ ...getHeader, fixVar: "Variável", recurring: false }))}
                                                    className={cn(
                                                    "flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                    formData.fixVar === "Variável" && !formData.recurring
                                                        ? "bg-white dark:bg-zinc-800 text-amber-600 shadow-sm ring-1 ring-black/5"
                                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    <Calendar className="w-4 h-4" /> Variável
                                                </button>
                                                <button
                                                    onClick={() => setFormData(getHeader => ({ ...getHeader, fixVar: "Fixo", recurring: true }))}
                                                    className={cn(
                                                    "flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                                    formData.fixVar === "Fixo" || formData.recurring
                                                        ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm ring-1 ring-black/5"
                                                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    <Repeat className="w-4 h-4" /> Recorrente
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                                        <div className="flex gap-3">
                                            <Info className="w-5 h-5 text-amber-600 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Revisão Pendente?</p>
                                                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                                                    Após salvar, esta transação será marcada como "Revisada". Se desejar criar automação, vá para a aba "Regras".
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Classification List */}
                                <div className="space-y-4 flex flex-col h-full bg-card border border-border rounded-2xl p-1 overflow-hidden shadow-sm">
                                    <div className="p-4 pb-2">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                                            <CheckCircle2 className="w-4 h-4 text-primary" /> Classificação
                                        </h4>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Buscar categoria (ex: Uber, Mercado)..." 
                                                value={categorySearch}
                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                className="pl-9 h-11 rounded-xl bg-secondary/30 border-border focus:ring-violet-500/20"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto min-h-[400px]">
                                        {filteredOptions.length === 0 ? (
                                            <div className="p-10 text-center flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
                                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                                    <Search className="w-6 h-6 opacity-40" />
                                                </div>
                                                <p className="text-sm">Nenhuma categoria encontrada para "{categorySearch}".</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5 p-2">
                                                {filteredOptions.slice(0, 100).map((opt) => {
                                                    const catConfig = getCategoryConfig(opt.category1);
                                                    const isSelected = formData.leafId === opt.leafId;
                                                    return (
                                                        <button
                                                            key={opt.leafId}
                                                            onClick={() => handleCategorySelect(opt)}
                                                            className={cn(
                                                                "w-full px-4 py-3 text-left text-sm hover:bg-secondary/50 transition-colors rounded-xl flex items-center gap-3",
                                                                isSelected && "bg-violet-50 dark:bg-violet-900/20 shadow-sm ring-1 ring-violet-200 dark:ring-violet-800"
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
                                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-600 ml-auto flex-shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Folder Path Footer */}
                                    <div className="p-3 bg-secondary/30 border-t border-border/50 text-xs text-muted-foreground text-center">
                                        Exibindo {filteredOptions.length} opções
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: RULES & IA */}
                        <TabsContent value="rules" className="space-y-6 mt-0">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="space-y-2">
                                     <h3 className="text-lg font-bold font-display flex items-center gap-2">
                                         <Wand2 className="w-5 h-5 text-emerald-500" />
                                         Automação de Categorização
                                     </h3>
                                     <p className="text-sm text-muted-foreground">
                                         Crie regras para classificar automaticamente transações futuras semelhantes a esta.
                                         As regras são baseadas em palavras-chave encontradas na descrição.
                                     </p>
                                </div>

                                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                                     <div className="space-y-3">
                                         <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Classificar como</label>
                                         <div className="p-4 bg-secondary/20 rounded-xl border border-border flex items-center gap-3">
                                              {formData.leafId ? (
                                                  <>
                                                    <CategoryIcon category={getCategoryConfig(formData.category1).name} />
                                                    <div>
                                                        <div className="font-bold text-foreground">{formData.category1}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formData.category2} {formData.category3 ? `> ${formData.category3}` : ""}
                                                        </div>
                                                    </div>
                                                  </>
                                              ) : (
                                                  <div className="text-muted-foreground text-sm italic">
                                                      Selecione uma categoria na aba "Classificação" primeiro.
                                                  </div>
                                              )}
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Palavras-chave (Incluir)</label>
                                             <Input 
                                                value={ruleKeywords}
                                                onChange={(e) => setRuleKeywords(e.target.value)}
                                                className="bg-emerald-50/50 border-emerald-200 dark:border-emerald-800/30"
                                                placeholder="Ex: UBER; IFOOD"
                                             />
                                             <p className="text-[10px] text-muted-foreground">Se encontrar QUALQUER uma destas (separadas por ;)</p>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Palavras-chave (Excluir)</label>
                                             <Input 
                                                value={ruleNegativeKeywords}
                                                onChange={(e) => setRuleNegativeKeywords(e.target.value)}
                                                className="bg-red-50/50 border-red-200 dark:border-red-800/30"
                                                placeholder="Ex: ESTORNO"
                                             />
                                             <p className="text-[10px] text-muted-foreground">Mas NÃO deve conter estas</p>
                                         </div>
                                     </div>

                                     <Button 
                                        className="w-full font-bold h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={isRulePending || !formData.leafId}
                                        onClick={handleCreateRule}
                                     >
                                         {isRulePending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                         Criar Regra
                                     </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB: DEBUG */}
                        <TabsContent value="debug" className="space-y-6 mt-0">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-zinc-950 text-zinc-300 font-mono text-xs p-6 rounded-2xl overflow-x-auto border border-zinc-800 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4 text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">
                                        <Code className="w-4 h-4" /> Raw Transaction Data
                                    </div>
                                    <pre>{JSON.stringify(transaction, null, 2)}</pre>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
          </div>
      </SheetContent>
    </Sheet>
  );
}

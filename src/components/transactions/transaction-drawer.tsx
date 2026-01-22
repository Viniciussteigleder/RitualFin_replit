"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { 
  Calendar, Building2, Tag, FileText, ExternalLink, Edit, Trash2, CheckCircle2, AlertTriangle,
  Hash, Database, Upload, Zap, Clock, Info, Loader2, Save, X
} from "lucide-react";
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
import { useState, useEffect } from "react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { diagnoseTransaction, TransactionDiagnosticResult } from "@/lib/actions/diagnostics";
import { updateTransactionDetails } from "@/lib/actions/transactions";
import { toast } from "sonner";

type Transaction = {
  id: string;
  paymentDate: Date;
  bookingDate?: Date | null;
  importedAt?: Date | null;
  createdAt?: Date | null;
  descRaw: string;
  descNorm: string;
  keyDesc?: string | null;
  aliasDesc?: string | null;
  simpleDesc?: string | null;
  amount: number;
  currency?: string | null;
  foreignAmount?: number | null;
  foreignCurrency?: string | null;
  category1?: string | null;
  category2?: string | null;
  category3?: string | null;
  type?: string | null;
  fixVar?: string | null;
  recurring?: boolean | null;
  source?: string | null;
  accountSource?: string | null;
  status?: string | null;
  confidence?: number | null;
  needsReview: boolean;
  manualOverride: boolean;
  classifiedBy?: string | null;
  ruleIdApplied?: string | null;
  leafId?: string | null;
  uploadId?: string | null;
  ingestionItemId?: string | null;
  key?: string | null;
  internalTransfer?: boolean | null;
  excludeFromBudget?: boolean | null;
  accountId?: string | null;
  conflictFlag?: boolean | null;
  classificationCandidates?: any | null;
  // Taxonomy fields
  level1?: string | null;
  level2?: string | null;
  level3?: string | null;
  appCategory?: string | null;
  matchedKeyword?: string | null;
};

interface TransactionDrawerProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onConfirm?: (transactionId: string) => void;
  onLeafChange?: (transactionId: string, leafId: string) => void;
  // Options
  appCategories?: string[];
  categories1?: string[];
  categories2?: string[];
  categories3?: string[];
}

export function TransactionDrawer({ 
  transaction, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onConfirm,
  onLeafChange,
  appCategories = [],
  categories1 = [],
  categories2 = [],
  categories3 = []
}: TransactionDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<TransactionDiagnosticResult | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: "",
    fixVar: "",
    recurring: false,
    appCategory: "",
    category1: "",
    category2: "",
    category3: "",
  });

  // Initialize form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || "Despesa",
        fixVar: transaction.fixVar || "Variável",
        recurring: transaction.recurring || false,
        appCategory: transaction.appCategory || transaction.appCategory || "OPEN",
        category1: transaction.category1 || "OPEN",
        category2: transaction.category2 || "OPEN",
        category3: transaction.category3 || "OPEN",
      });
    }
  }, [transaction]);

  const handleDiagnostic = async () => {
    if (!transaction) return;
    setIsDiagnosing(true);
    try {
      const result = await diagnoseTransaction(transaction.id);
      setDiagnosticResult(result);
    } catch (error) {
      console.error("Diagnostic failed", error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  if (!transaction) return null;

  const displayName = transaction.aliasDesc || transaction.simpleDesc || transaction.descNorm || transaction.descRaw;
  const categoryConfig = transaction.category1 ? CATEGORY_CONFIGS[transaction.category1] : null;

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja eliminar esta transação?")) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(transaction.id);
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAndConfirm = async () => {
    setIsSaving(true);
    try {
      // 1. Update details
      const result = await updateTransactionDetails(transaction.id, {
        transactionId: transaction.id,
        type: formData.type as any,
        fixVar: formData.fixVar as any,
        recurring: formData.recurring,
        appCategory: formData.appCategory,
        category1: formData.category1,
        category2: formData.category2,
        category3: formData.category3,
      });

      if (!result.success) {
        toast.error("Erro ao salvar alterações: " + result.error);
        return;
      }

      toast.success("Transação atualizada e confirmada!");
      
      // 2. Refresh parent list (via simple close + optimistic update if provided, but confirm calls refresh)
      onOpenChange(false);
      
      // If parent passed onConfirm, call it purely for list state update side-effects if needed
      // But updateTransactionDetails already marks as reviewed.
      // We can trigger router refresh or rely on result.
    } catch (error) {
      toast.error("Erro inesperado ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto sm:w-[800px]">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <SheetTitle className="text-2xl font-display leading-tight">
                {displayName}
              </SheetTitle>
              {transaction.descRaw !== displayName && (
                <SheetDescription className="text-xs font-mono text-muted-foreground break-all">
                  {transaction.descRaw}
                </SheetDescription>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold font-mono ${
                transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatCurrency(transaction.amount)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.type || transaction.type || 'Despesa'}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {transaction.needsReview && (
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                Aguarda Revisão
              </Badge>
            )}
            {transaction.manualOverride && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                Editado Manualmente
              </Badge>
            )}
            {transaction.confidence !== null && transaction.confidence !== undefined && transaction.confidence < 90 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                Confiança: {transaction.confidence}%
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <Tabs defaultValue="classification" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="classification">Classificação</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Regras & IA</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            {/* Tab 1: Classification (Editable) */}
            <TabsContent value="classification" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Lado Esquerdo: Categorias */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categorização
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">App Category</Label>
                       <Select 
                          value={formData.appCategory} 
                          onValueChange={(v) => setFormData(p => ({ ...p, appCategory: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="OPEN">OPEN</SelectItem>
                             {appCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Categoria 1</Label>
                       <Select 
                          value={formData.category1} 
                          onValueChange={(v) => setFormData(p => ({ ...p, category1: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="OPEN">OPEN</SelectItem>
                             {categories1.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Categoria 2</Label>
                       <Select 
                          value={formData.category2} 
                          onValueChange={(v) => setFormData(p => ({ ...p, category2: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="OPEN">OPEN</SelectItem>
                             {categories2.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Categoria 3</Label>
                       <Select 
                          value={formData.category3} 
                          onValueChange={(v) => setFormData(p => ({ ...p, category3: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="OPEN">OPEN</SelectItem>
                             {categories3.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Flags e Tipo */}
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Propriedades
                  </h3>

                  <div className="bg-secondary/20 p-4 rounded-xl space-y-4 border border-border/50">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Tipo</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Despesa">Despesa</SelectItem>
                                <SelectItem value="Receita">Receita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Fixo / Variável</Label>
                        <Select 
                            value={formData.fixVar} 
                            onValueChange={(v) => setFormData(p => ({ ...p, fixVar: v }))}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fixo">Fixo</SelectItem>
                                <SelectItem value="Variável">Variável</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm">Recorrente</Label>
                            <p className="text-xs text-muted-foreground">Repete mensalmente</p>
                        </div>
                        <Switch 
                            checked={formData.recurring} 
                            onCheckedChange={(c) => setFormData(p => ({ ...p, recurring: c }))} 
                        />
                    </div>
                  </div>
                </div>

              </div>
              
              <Separator />

              {/* Leaf ID Display (Read Only) */}
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                  <span className="font-mono">Leaf ID: {transaction.leafId || 'N/A'}</span>
                  <span className="font-mono">{transaction.status || 'OPEN'}</span>
              </div>
            </TabsContent>

            {/* Tab 2: Overview (Read Only Summary) */}
            <TabsContent value="overview" className="space-y-4 mt-4">
               {/* Keep original overview content mostly intact, but read-only */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Data</span>
                    </div>
                    <div className="font-mono font-bold text-foreground">
                        {new Date(transaction.paymentDate).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  {transaction.source && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Origem</span>
                      </div>
                      <div className="font-bold text-foreground">{transaction.source}</div>
                    </div>
                  )}
               </div>
               
               {/* Original description box */}
               {transaction.descNorm !== transaction.descRaw && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Descrição Original</h3>
                    <div className="bg-secondary/30 border border-border rounded-xl p-4">
                        <p className="text-sm font-mono text-muted-foreground break-all">{transaction.descRaw}</p>
                    </div>
                </div>
               )}
            </TabsContent>

             {/* Tab 3: Rules - Keep original content */}
             <TabsContent value="rules" className="space-y-4 mt-4">
                 {/* ... (Keep existing Rules & IA content) ... */}
                 {/* Valid to replace with component or keep raw JSX. I'll paste back the relevant parts from original */}
                 <div className="space-y-3">
                    <div className="bg-secondary/30 rounded-2xl p-4 border border-border space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Classificado Por:</span>
                            <Badge variant={transaction.classifiedBy === 'MANUAL' ? 'default' : 'secondary'}>
                            {transaction.classifiedBy || 'NÃO CLASSIFICADO'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Regra Aplicada:</span>
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {transaction.ruleIdApplied?.substring(0, 8) || 'Nenhuma'}
                            </code>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Palavra-chave:</span>
                            <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono font-bold">
                            {transaction.matchedKeyword || 'N/A'}
                            </code>
                        </div>
                    </div>
                 </div>
             </TabsContent>

            {/* Tab 4: Debug - Keep original content */}
            <TabsContent value="debug" className="space-y-4 mt-4">
               {/* ... (Keep existing Debug content) ... */}
               <Button 
                    onClick={handleDiagnostic} 
                    disabled={isDiagnosing} 
                    variant="outline" 
                    className="w-full bg-background/50 hover:bg-background border-dashed mb-4"
                >
                    {isDiagnosing ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Zap className="h-4 w-4 mr-2"/>}
                    Executar Diagnóstico Individual
                </Button>
                {diagnosticResult && (
                    <div className="bg-secondary/30 p-4 rounded-lg text-xs font-mono space-y-2">
                        {/* Short result display */}
                        <div className={diagnosticResult.integrity.passed ? "text-green-600" : "text-red-600"}>
                            {diagnosticResult.integrity.passed ? "Integridade OK" : "Falha na integridade"}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted p-4 rounded-xl">
                    <span>ID: {transaction.id}</span>
                </div>
            </TabsContent>

          </Tabs>

          <SheetFooter className="gap-2 sm:justify-between pt-4 border-t">
              <div className="flex gap-2">
                {onDelete && (
                    <Button 
                        variant="ghost" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                        <span className="ml-2 hidden sm:inline">Eliminar</span>
                    </Button>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <SheetClose asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">Cancelar</Button>
                 </SheetClose>
                 <Button 
                    onClick={handleSaveAndConfirm} 
                    disabled={isSaving}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar
                        </>
                    )}
                 </Button>
              </div>
          </SheetFooter>

        </div>
      </SheetContent>
    </Sheet>
  );
}

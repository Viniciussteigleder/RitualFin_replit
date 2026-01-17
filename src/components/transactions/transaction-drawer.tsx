"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Building2, Tag, FileText, ExternalLink, Edit, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
import { useState } from "react";
import { CategoryIcon } from "@/components/ui/category-icon";

type Transaction = {
  id: string;
  paymentDate: Date;
  descRaw: string;
  descNorm: string;
  aliasDesc?: string | null;
  simpleDesc?: string | null;
  amount: number;
  category1?: string | null;
  category2?: string | null;
  category3?: string | null;
  type?: string | null;
  fixVar?: string | null;
  source?: string | null;
  confidence?: number | null;
  needsReview: boolean;
  manualOverride: boolean;
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
}

export function TransactionDrawer({ 
  transaction, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onConfirm,
  onLeafChange
}: TransactionDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      if (onConfirm) {
        await onConfirm(transaction.id);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <SheetTitle className="text-2xl font-display leading-tight">
                {displayName}
              </SheetTitle>
              {transaction.descRaw !== displayName && (
                <SheetDescription className="text-xs font-mono text-muted-foreground">
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
              <div className="text-xs text-muted-foreground mt-1">
                {transaction.type || 'Despesa'}
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
          {/* Conflict Resolution Section */}
          {transaction.conflictFlag && transaction.classificationCandidates && (
            <div className="p-4 border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wide text-xs">
                <AlertTriangle className="w-4 h-4" />
                Conflito de Regras Detectado
                </div>
                <p className="text-sm text-amber-900 dark:text-amber-200">
                O sistema encontrou múltiplas regras para esta transação. Escolha a mais adequada para resolver:
                </p>
                <div className="grid gap-2">
                {Array.isArray(transaction.classificationCandidates) && transaction.classificationCandidates.map((match: any, idx: number) => (
                    <button 
                        key={idx}
                        onClick={() => {
                            if (onLeafChange && match.leafId) {
                                onLeafChange(transaction.id, match.leafId);
                                if (onConfirm) onConfirm(transaction.id);
                            }
                        }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-card border border-amber-200 dark:border-amber-800 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left group"
                    >
                        <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                                {match.appCategoryName ? `${match.appCategoryName} → ` : ""}{match.category1}
                                {match.category2 && <span className="text-xs font-normal text-muted-foreground">→ {match.category2}</span>}
                                {match.category3 && <span className="text-xs font-normal text-muted-foreground">→ {match.category3}</span>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Regra: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{match.matchedKeyword}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-1 rounded-lg">
                            {match.strict ? "STRICT" : `P${match.priority ?? "?"}`}
                        </div>
                    </button>
                ))}
                </div>
            </div>
          )}

          {/* Category Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Categorização</h3>
            <div className="space-y-2 bg-secondary/30 rounded-2xl p-4 border border-border">
              {categoryConfig ? (
                <>
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={transaction.category1} size="md" />
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{transaction.category1}</div>
                      {transaction.category2 && (
                        <div className="text-sm text-muted-foreground">
                          {transaction.category2}
                          {transaction.category3 && ` → ${transaction.category3}`}
                        </div>
                      )}
                    </div>
                    <Badge 
                      className="border-none" 
                      style={{ 
                        backgroundColor: `${categoryConfig.color}20`,
                        color: categoryConfig.color 
                      }}
                    >
                      {transaction.fixVar || 'Variável'}
                    </Badge>
                  </div>

                  {/* Taxonomy Details */}
                  {(transaction.level1 || transaction.appCategory) && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Classificação Automática</div>
                        
                        {/* Matched Keyword */}
                        {transaction.matchedKeyword && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Tag className="w-3 h-3" /> Keyword:
                            </span>
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold text-primary">
                              {transaction.matchedKeyword}
                            </code>
                          </div>
                        )}

                        {/* Hierarquia */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Nível 1:</span>
                          <span className="font-medium">{transaction.level1 || 'OPEN'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Nível 2:</span>
                          <span className="font-medium">{transaction.level2 || 'OPEN'}</span>
                        </div>
                        {transaction.level3 && transaction.level3 !== 'OPEN' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Nível 3:</span>
                            <span className="font-medium">{transaction.level3}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">App Category:</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {transaction.appCategory || 'OPEN'}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem categoria definida</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Detalhes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Data</span>
                </div>
                <div className="font-mono font-bold text-foreground">
                  {new Date(transaction.paymentDate).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {transaction.source && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Origem</span>
                  </div>
                  <div className="font-bold text-foreground">
                    {transaction.source}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Description */}
          {transaction.descNorm !== transaction.descRaw && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Descrição Original</h3>
              <div className="bg-secondary/30 border border-border rounded-xl p-4">
                <p className="text-sm font-mono text-muted-foreground break-words">
                  {transaction.descRaw}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {transaction.needsReview && (
              <Button 
                onClick={handleConfirm} 
                disabled={isConfirming}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming ? 'A confirmar...' : 'Confirmar'}
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                onClick={() => onEdit(transaction)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'A eliminar...' : 'Eliminar'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

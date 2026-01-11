"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Building2, Tag, FileText, ExternalLink, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
import { useState } from "react";

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
};

interface TransactionDrawerProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onConfirm?: (transactionId: string) => void;
}

export function TransactionDrawer({ 
  transaction, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onConfirm
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
          {/* Category Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Categorização</h3>
            <div className="space-y-2 bg-secondary/30 rounded-2xl p-4 border border-border">
              {categoryConfig ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-xl">
                      {categoryConfig.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{transaction.category1}</div>
                      {transaction.category2 && (
                        <div className="text-sm text-muted-foreground">
                          {transaction.category2}
                          {transaction.category3 && ` → ${transaction.category3}`}
                        </div>
                      )}
                    </div>
                    <Badge className={`${categoryConfig.bgColor} ${categoryConfig.textColor} border-none`}>
                      {transaction.fixVar || 'Variável'}
                    </Badge>
                  </div>
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

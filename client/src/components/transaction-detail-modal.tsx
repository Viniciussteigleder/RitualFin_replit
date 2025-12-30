/**
 * Transaction Detail Modal
 *
 * Rich detailed view of a single transaction with:
 * - Merchant icon and branding
 * - Full description and metadata
 * - Category hierarchy
 * - Related transactions (future: backend support)
 * - Quick actions
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMerchantIcon, getCategoryIcon } from "@/lib/merchant-icons";
import { AccountBadge } from "@/components/account-badge";
import {
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Tag,
  TrendingUp,
  Edit,
  Copy,
  Trash2,
  ChevronRight,
  Info,
  ArrowLeftRight
} from "lucide-react";

interface TransactionDetailModalProps {
  transaction: any;
  account?: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (transaction: any) => void;
}

export function TransactionDetailModal({
  transaction,
  account,
  isOpen,
  onClose,
  onEdit
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  // Get merchant icon or fallback to category icon
  const merchantInfo = getMerchantIcon(transaction.descRaw);
  const MerchantIcon = merchantInfo?.icon || getCategoryIcon(transaction.category1);
  const iconColor = merchantInfo?.color || "#6b7280";

  // Split description parts (if formatted as "Main -- Additional")
  const [mainDesc, ...additionalParts] = (transaction.descRaw || "").split(" -- ");
  const additionalDesc = additionalParts.join(" -- ");

  const CATEGORY_COLORS: Record<string, string> = {
    "Mercado": "#22c55e",
    "Lazer": "#a855f7",
    "Transporte": "#3b82f6",
    "Moradia": "#f97316",
    "Saúde": "#ef4444",
    "Compras Online": "#ec4899",
    "Receitas": "#10b981",
    "Outros": "#6b7280",
    "Interno": "#475569"
  };

  const categoryColor = CATEGORY_COLORS[transaction.category1] || "#6b7280";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalhes da Transação</DialogTitle>
        </DialogHeader>

        {/* Header with Merchant Icon */}
        <div className="flex items-start gap-4 pb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <MerchantIcon className="w-8 h-8" style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{mainDesc}</h2>
            {additionalDesc && (
              <p className="text-sm text-muted-foreground mt-1">{additionalDesc}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {merchantInfo?.merchantName && (
                <Badge variant="outline" className="text-xs capitalize">
                  {merchantInfo.merchantName.replace(/_/g, " ")}
                </Badge>
              )}
              {transaction.manualOverride && (
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                  Manual Override
                </Badge>
              )}
              {transaction.internalTransfer && (
                <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                  <ArrowLeftRight className="w-3 h-3 mr-1" />
                  Transferência Interna
                </Badge>
              )}
              {transaction.excludeFromBudget && (
                <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">
                  Excluído do Orçamento
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor</p>
          <p className={cn(
            "text-3xl font-bold",
            transaction.type === "Receita" ? "text-emerald-600" : "text-foreground"
          )}>
            {transaction.type === "Receita" ? "+" : "-"}
            {Math.abs(transaction.amount || 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "EUR"
            })}
          </p>
        </div>

        <Separator />

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              Data
            </div>
            <p className="font-medium">
              {format(new Date(transaction.paymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <CreditCard className="w-3.5 h-3.5" />
              Conta
            </div>
            {account ? (
              <AccountBadge account={account} size="sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{transaction.accountSource}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Tag className="w-3.5 h-3.5" />
              Tipo
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {transaction.type}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {transaction.fixVar}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" />
              Forma de Pagamento
            </div>
            <p className="font-medium text-sm">{transaction.paymentType || "—"}</p>
          </div>
        </div>

        <Separator />

        {/* Category Hierarchy */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Categorização
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="font-semibold">{transaction.category1}</span>
            {transaction.category2 && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{transaction.category2}</span>
              </>
            )}
            {transaction.category3 && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{transaction.category3}</span>
              </>
            )}
          </div>

          {transaction.ruleIdApplied && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              Categorizado automaticamente por regra
              {transaction.confidence && (
                <Badge variant="outline" className="text-xs">
                  {transaction.confidence}% confiança
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Related Transactions (Placeholder for backend support) */}
        {/* <Separator />
        <div className="space-y-3">
          <p className="text-sm font-medium">Transações Relacionadas</p>
          <p className="text-sm text-muted-foreground">
            Você gastou €{Math.abs(transaction.amount * 3).toFixed(2)} em {mainDesc.split(" ")[0]} 3 vezes este mês
          </p>
        </div> */}

        <Separator />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Copy className="w-4 h-4" />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-rose-600 hover:text-rose-700">
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

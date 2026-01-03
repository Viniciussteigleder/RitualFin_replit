import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2, Edit2, Filter, X, Calendar, TrendingUp, TrendingDown, ArrowUpDown, Eye, Lock, RefreshCw, RotateCcw, ArrowLeftRight } from "lucide-react";
import { getStatusIcon, getTransactionIcons, IconBadge } from "@/lib/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, accountsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AccountBadge } from "@/components/account-badge";
import { useMonth } from "@/lib/month-context";
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { AliasLogo } from "@/components/alias-logo";
import { TransactionListSkeleton } from "@/components/skeletons/transaction-list-skeleton";
import { transactionsCopy, translateCategory, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Saúde": "#ef4444",
  "Lazer": "#a855f7",
  "Compras Online": "#ec4899",
  "Receitas": "#10b981",
  "Interno": "#475569",
  "Outros": "#6b7280"
};

interface TransactionForm {
  type: string;
  fixVar: string;
  category1: string;
  category2: string;
  category3: string;
  excludeFromBudget: boolean;
  internalTransfer: boolean;
}

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const locale = useLocale();
  const transactionIcons = getTransactionIcons(locale);
  const { month } = useMonth();
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const dateShortFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });

  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState<TransactionForm | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  const accountsById = useMemo(() => {
    return accounts.reduce((map: any, account: any) => {
      map[account.id] = account;
      return map;
    }, {});
  }, [accounts]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      closeDialog();
      toast({ title: translate(locale, transactionsCopy.toastUpdated) });
    },
    onError: (error: any) => {
      toast({ title: translate(locale, transactionsCopy.toastUpdateError), description: error.message, variant: "destructive" });
    }
  });

  const openEditDialog = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type || "Despesa",
      fixVar: transaction.fixVar || "Variável",
      category1: transaction.category1 || "Outros",
      category2: transaction.category2 || "",
      category3: transaction.category3 || "",
      excludeFromBudget: transaction.excludeFromBudget || false,
      internalTransfer: transaction.internalTransfer || false
    });
  };

  const closeDialog = () => {
    setEditingTransaction(null);
    setFormData(null);
  };

  const handleSubmit = () => {
    if (!formData || !editingTransaction) return;
    updateMutation.mutate({
      id: editingTransaction.id,
      data: {
        ...formData,
        manualOverride: true
      }
    });
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      translate(locale, transactionsCopy.csvHeaderDate),
      translate(locale, transactionsCopy.csvHeaderAccount),
      translate(locale, transactionsCopy.csvHeaderDescription),
      translate(locale, transactionsCopy.csvHeaderAmount),
      translate(locale, transactionsCopy.csvHeaderCategory),
      translate(locale, transactionsCopy.csvHeaderType),
      translate(locale, transactionsCopy.csvHeaderFixVar)
    ];
    const csv = [
      csvHeaders.join(","),
      ...filteredTransactions.map((t: any) => [
        dateFormatter.format(new Date(t.paymentDate)),
        accountsById[t.accountId]?.name || t.accountSource || "",
        `"${t.descRaw?.replace(/"/g, '""')}"`,
        t.amount,
        t.category1 || "",
        t.type || "",
        t.fixVar || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = formatMessage(translate(locale, transactionsCopy.csvFilename), { month });
    link.click();
    toast({ title: translate(locale, transactionsCopy.exportSuccess) });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      const haystack = `${t.aliasDesc || ""} ${t.simpleDesc || ""} ${t.descRaw || ""}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) {
        return false;
      }
      if (accountFilter !== "all" && t.accountId !== accountFilter) {
        return false;
      }
      if (categoryFilter !== "all" && t.category1 !== categoryFilter) {
        return false;
      }
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, search, accountFilter, categoryFilter, typeFilter]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t: any) => t.type === "Receita")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t: any) => t.type === "Despesa")
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    return {
      total: filteredTransactions.length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = search || accountFilter !== "all" || categoryFilter !== "all" || typeFilter !== "all";

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{translate(locale, transactionsCopy.title)}</h1>
            <p className="text-muted-foreground">{translate(locale, transactionsCopy.subtitle)}</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {translate(locale, transactionsCopy.exportCsv)}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{translate(locale, transactionsCopy.statsTotal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-600">
                {currencyFormatter.format(stats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {translate(locale, transactionsCopy.statsIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-rose-600">
                {currencyFormatter.format(stats.totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                {translate(locale, transactionsCopy.statsExpense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className={cn(
                "text-2xl font-bold",
                stats.balance >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {currencyFormatter.format(stats.balance)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                {translate(locale, transactionsCopy.statsBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={translate(locale, transactionsCopy.searchPlaceholder)}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {translate(locale, transactionsCopy.filters)}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  {translate(locale, transactionsCopy.clearFilters)}
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.filterAccountLabel)}</Label>
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate(locale, transactionsCopy.filterAccountAll)}</SelectItem>
                      {accounts.filter((a: any) => a.isActive).map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.filterCategoryLabel)}</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate(locale, transactionsCopy.filterCategoryAll)}</SelectItem>
                      {Object.keys(CATEGORY_COLORS).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {translateCategory(locale, cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.filterTypeLabel)}</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translate(locale, transactionsCopy.filterTypeAll)}</SelectItem>
                      <SelectItem value="Despesa">{translate(locale, transactionsCopy.typeExpensePlural)}</SelectItem>
                      <SelectItem value="Receita">{translate(locale, transactionsCopy.typeIncomePlural)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {isLoading ? (
          <TransactionListSkeleton rows={8} />
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                {hasActiveFilters ? translate(locale, transactionsCopy.emptyWithFilters) : translate(locale, transactionsCopy.emptyPeriod)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableDate)}</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableAccount)}</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableDescription)}</th>
                      <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableSignals)}</th>
                      <th className="px-5 py-3 text-right font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableAmount)}</th>
                      <th className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableCategory)}</th>
                      <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableStatus)}</th>
                      <th className="px-5 py-3 text-center font-medium text-xs uppercase tracking-wide">{translate(locale, transactionsCopy.tableActions)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredTransactions.map((t: any) => {
                      const categoryColor = CATEGORY_COLORS[t.category1] || "#6b7280";
                      const fallbackDesc = t.simpleDesc || t.descRaw?.split(" -- ")[0]?.replace(/\s+\d{4,}/g, '');
                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setViewingTransaction(t)}
                        >
                          <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                            {dateShortFormatter.format(new Date(t.paymentDate))}
                          </td>
                          <td className="px-5 py-4">
                            <AccountBadge account={accountsById[t.accountId]} size="sm" iconOnly />
                          </td>
                          <td className="px-5 py-4 max-w-[300px]">
                            <div className="flex items-center gap-2">
                              <AliasLogo
                                aliasDesc={t.aliasDesc}
                                fallbackDesc={fallbackDesc}
                                logoUrl={t.logoLocalPath}
                                size={24}
                                showText={false}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium truncate">
                                    {t.aliasDesc || fallbackDesc}
                                  </p>
                                  {/* Icon badges for transaction attributes */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {t.fixVar === "Fixo" && (
                                      <IconBadge {...transactionIcons.fixed} size="xs" />
                                    )}
                                    {(t.recurringFlag || t.recurring) && (
                                      <IconBadge {...transactionIcons.recurring} size="xs" />
                                    )}
                                    {t.isRefund && (
                                      <IconBadge {...transactionIcons.refund} size="xs" />
                                    )}
                                    {t.internalTransfer && (
                                      <IconBadge {...transactionIcons.internal} size="xs" />
                                    )}
                                  </div>
                                </div>
                                {(t.category2 || t.category3) && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {[t.category2, t.category3].filter(Boolean).join(" → ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {t.type && (
                                <IconBadge
                                  {...(t.type === "Receita" ? transactionIcons.income : transactionIcons.expense)}
                                  size="xs"
                                />
                              )}
                              {t.fixVar === "Fixo" && (
                                <IconBadge {...transactionIcons.fixed} size="xs" />
                              )}
                              {t.fixVar === "Variável" && (
                                <IconBadge {...transactionIcons.variable} size="xs" />
                              )}
                              {(t.recurringFlag || t.recurring) && (
                                <IconBadge {...transactionIcons.recurring} size="xs" />
                              )}
                              {t.isRefund && (
                                <IconBadge {...transactionIcons.refund} size="xs" />
                              )}
                              {t.internalTransfer && (
                                <IconBadge {...transactionIcons.internal} size="xs" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">
                            <span className={t.amount > 0 ? "text-emerald-600" : ""}>
                              {currencyFormatter.format(t.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: categoryColor }}
                              />
                              <span className="text-sm">
                                {translateCategory(locale, t.category1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              {(() => {
                                const statusInfo = getStatusIcon(t, locale);
                                return (
                                  <div className="flex items-center gap-1" title={statusInfo.label}>
                                    <IconBadge {...statusInfo} size="sm" showTooltip={false} />
                                    {t.excludeFromBudget && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {translate(locale, transactionsCopy.excludeBadge)}
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingTransaction(t);
                                }}
                                title={translate(locale, transactionsCopy.viewDetails)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(t);
                                }}
                                title={translate(locale, transactionsCopy.editAction)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          transaction={viewingTransaction}
          account={viewingTransaction ? accountsById[viewingTransaction.accountId] : undefined}
          isOpen={!!viewingTransaction}
          onClose={() => setViewingTransaction(null)}
          onEdit={openEditDialog}
        />

        {/* Edit Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{translate(locale, transactionsCopy.editTitle)}</DialogTitle>
            </DialogHeader>
            {formData && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.typeLabel)}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Despesa">{translate(locale, transactionsCopy.typeExpense)}</SelectItem>
                      <SelectItem value="Receita">{translate(locale, transactionsCopy.typeIncome)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.fixVarLabel)}</Label>
                  <Select
                    value={formData.fixVar}
                    onValueChange={(value) => setFormData({ ...formData, fixVar: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixo">{translate(locale, transactionsCopy.fixedOption)}</SelectItem>
                      <SelectItem value="Variável">{translate(locale, transactionsCopy.variableOption)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.categoryMainLabel)}</Label>
                  <Select
                    value={formData.category1}
                    onValueChange={(value) => setFormData({ ...formData, category1: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORY_COLORS).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {translateCategory(locale, cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.subcategoryLabel)}</Label>
                  <Input
                    value={formData.category2}
                    onChange={(e) => setFormData({ ...formData, category2: e.target.value })}
                    placeholder={translate(locale, transactionsCopy.subcategoryPlaceholder)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{translate(locale, transactionsCopy.detailLabel)}</Label>
                  <Input
                    value={formData.category3}
                    onChange={(e) => setFormData({ ...formData, category3: e.target.value })}
                    placeholder={translate(locale, transactionsCopy.detailPlaceholder)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeFromBudget"
                    checked={formData.excludeFromBudget}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, excludeFromBudget: !!checked })
                    }
                  />
                  <Label htmlFor="excludeFromBudget" className="font-normal">
                    {translate(locale, transactionsCopy.excludeBudget)}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internalTransfer"
                    checked={formData.internalTransfer}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, internalTransfer: !!checked })
                    }
                  />
                  <Label htmlFor="internalTransfer" className="font-normal">
                    {translate(locale, transactionsCopy.internalTransfer)}
                  </Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                {translate(locale, transactionsCopy.cancel)}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate(locale, transactionsCopy.saving)}
                  </>
                ) : (
                  translate(locale, transactionsCopy.save)
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

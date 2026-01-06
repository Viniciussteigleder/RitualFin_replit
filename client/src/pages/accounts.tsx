import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Archive, Loader2, CreditCard, Landmark, Wallet, Coins, Edit2, CircleCheck, AlertTriangle, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { accountsCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const ACCOUNT_TYPE_ICONS: Record<string, any> = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Landmark,
  cash: Wallet
};

const PRESET_COLOR_KEYS = [
  { value: "#3b82f6", key: "blue" },
  { value: "#ef4444", key: "red" },
  { value: "#8b5cf6", key: "purple" },
  { value: "#10b981", key: "green" },
  { value: "#f59e0b", key: "orange" },
  { value: "#ec4899", key: "pink" },
  { value: "#6366f1", key: "indigo" },
  { value: "#6b7280", key: "gray" }
];

const PRESET_ICON_KEYS = [
  { value: "credit-card", key: "credit-card", Icon: CreditCard },
  { value: "landmark", key: "landmark", Icon: Landmark },
  { value: "wallet", key: "wallet", Icon: Wallet },
  { value: "coins", key: "coins", Icon: Coins }
];

interface AccountFormData {
  name: string;
  type: "credit_card" | "debit_card" | "bank_account" | "cash";
  accountNumber: string;
  icon: string;
  color: string;
}

const EMPTY_ACCOUNT: AccountFormData = {
  name: "",
  type: "credit_card",
  accountNumber: "",
  icon: "credit-card",
  color: "#6366f1"
};

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState<AccountFormData>(EMPTY_ACCOUNT);
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  const accountTypeLabels = translate(locale, accountsCopy.typeLabels) as Record<string, string>;
  const colorLabels = translate(locale, accountsCopy.colorLabels) as Record<string, string>;
  const iconLabels = translate(locale, accountsCopy.iconLabels) as Record<string, string>;

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      closeDialog();
      toast({ title: translate(locale, accountsCopy.toastCreated) });
    },
    onError: (error: any) => {
      toast({ title: translate(locale, accountsCopy.toastCreateError), description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      closeDialog();
      toast({ title: translate(locale, accountsCopy.toastUpdated) });
    },
    onError: (error: any) => {
      toast({ title: translate(locale, accountsCopy.toastUpdateError), description: error.message, variant: "destructive" });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: translate(locale, accountsCopy.toastArchived) });
    },
    onError: (error: any) => {
      toast({ title: translate(locale, accountsCopy.toastArchiveError), description: error.message, variant: "destructive" });
    }
  });

  const openCreateDialog = () => {
    setEditingAccount(null);
    setFormData(EMPTY_ACCOUNT);
    setIsOpen(true);
  };

  const openEditDialog = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      accountNumber: account.accountNumber || "",
      icon: account.icon || "credit-card",
      color: account.color || "#6366f1"
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditingAccount(null);
    setFormData(EMPTY_ACCOUNT);
  };

  const handleSubmit = () => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm(translate(locale, accountsCopy.confirmArchive))) {
      archiveMutation.mutate(id);
    }
  };

  const filtered = accounts.filter((account: any) =>
    account.isActive &&
    (search === "" || account.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getIconComponent = (iconName: string) => {
    const icon = PRESET_ICON_KEYS.find(i => i.value === iconName);
    return icon ? icon.Icon : CreditCard;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{translate(locale, accountsCopy.title)}</h1>
            <p className="text-muted-foreground text-sm md:text-base">{translate(locale, accountsCopy.subtitle)}</p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {translate(locale, accountsCopy.newAccount)}
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translate(locale, accountsCopy.searchPlaceholder)}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Net Position Card */}
        {!isLoading && accounts.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-50 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{translate(locale, accountsCopy.netPositionTitle)}</p>
                  <h2 className="text-3xl font-bold text-primary">
                    {(() => {
                      // Calculate: Bank balance - (sum of card balances)
                      const bankAccounts = accounts.filter((a: any) => a.type === "bank_account");
                      const creditCards = accounts.filter((a: any) => a.type === "credit_card");

                      const bankBalance = bankAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
                      const cardUsed = creditCards.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
                      const netPosition = bankBalance - cardUsed;

                      return currencyFormatter.format(netPosition);
                    })()}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {translate(locale, accountsCopy.netPositionHint)}
                  </p>
                </div>
                {(() => {
                  const hasStaleBalance = accounts.some((a: any) => {
                    if (!a.balanceUpdatedAt) return false;
                    const daysSince = Math.floor(
                      (new Date().getTime() - new Date(a.balanceUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysSince > 7;
                  });

                  return hasStaleBalance && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">{translate(locale, accountsCopy.staleBalances)}</span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accounts List */}
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? translate(locale, accountsCopy.emptySearch) : translate(locale, accountsCopy.emptyAll)}
              </p>
              {!search && (
                <Button variant="outline" onClick={openCreateDialog} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  {translate(locale, accountsCopy.createFirst)}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((account: any) => {
              const IconComponent = getIconComponent(account.icon);
              return (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <IconComponent
                          className="h-6 w-6"
                          style={{ color: account.color }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(account)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleArchive(account.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {accountTypeLabels[account.type] || account.type}
                      </Badge>
                      {account.lastUploadDate && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatMessage(translate(locale, accountsCopy.lastUpload), {
                            date: dateFormatter.format(new Date(account.lastUploadDate))
                          })}
                        </Badge>
                      )}
                      {account.accountNumber && (
                        <span className="text-xs text-muted-foreground">
                          •••• {account.accountNumber}
                        </span>
                      )}
                    </div>

                    {/* Balance */}
                    {account.balance !== undefined && account.balance !== null && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{translate(locale, accountsCopy.balance)}</span>
                          {account.balanceUpdatedAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatMessage(translate(locale, accountsCopy.updatedAt), {
                                date: dateFormatter.format(new Date(account.balanceUpdatedAt))
                              })}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-xl font-bold",
                          account.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {currencyFormatter.format(account.balance)}
                        </p>
                      </div>
                    )}

                    {/* Credit Card: Limit Bar + Available to Spend */}
                    {account.type === "credit_card" && account.limit && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{translate(locale, accountsCopy.limit)}</span>
                          <span className="font-medium">
                            {currencyFormatter.format(account.limit)}
                          </span>
                        </div>

                        {/* Limit Bar */}
                        {(() => {
                          const used = Math.abs(account.balance || 0);
                          const available = Math.max(0, account.limit - used);
                          const usedPercent = account.limit > 0 ? (used / account.limit) * 100 : 0;

                          return (
                            <>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    usedPercent > 90 ? "bg-red-500" :
                                    usedPercent > 70 ? "bg-amber-500" : "bg-primary"
                                  )}
                                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatMessage(translate(locale, accountsCopy.used), { amount: currencyFormatter.format(used) })}
                                </span>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-600">
                                    {formatMessage(translate(locale, accountsCopy.available), { amount: currencyFormatter.format(available) })}
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {account.isActive && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 mt-3">
                        <CircleCheck className="h-3 w-3" />
                        {translate(locale, accountsCopy.active)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? translate(locale, accountsCopy.editAccount) : translate(locale, accountsCopy.createAccountTitle)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{translate(locale, accountsCopy.nameLabel)}</Label>
                <Input
                  id="name"
                  placeholder={translate(locale, accountsCopy.namePlaceholder)}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{translate(locale, accountsCopy.typeLabel)}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(accountTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">{translate(locale, accountsCopy.lastDigitsLabel)}</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{translate(locale, accountsCopy.iconLabel)}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ICON_KEYS.map(({ value, key, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: value })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1",
                        formData.icon === value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px]">{iconLabels[key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{translate(locale, accountsCopy.colorLabel)}</Label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLOR_KEYS.map(({ value, key }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: value })}
                      className={cn(
                        "w-full aspect-square rounded-lg border-2 transition-all",
                        formData.color === value
                          ? "border-primary scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: value }}
                      title={colorLabels[key]}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">{translate(locale, accountsCopy.previewLabel)}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${formData.color}20` }}
                  >
                    {(() => {
                      const Icon = getIconComponent(formData.icon);
                      return <Icon className="h-5 w-5" style={{ color: formData.color }} />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium">{formData.name || translate(locale, accountsCopy.previewFallback)}</p>
                    <p className="text-xs text-muted-foreground">
                      {accountTypeLabels[formData.type] || formData.type}
                      {formData.accountNumber && ` • •••• ${formData.accountNumber}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                {translate(locale, accountsCopy.cancel)}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate(locale, accountsCopy.saving)}
                  </>
                ) : editingAccount ? (
                  translate(locale, accountsCopy.update)
                ) : (
                  translate(locale, accountsCopy.create)
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Archive, Loader2, CreditCard, Landmark, Wallet, Coins, Edit2, CircleCheck, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { getAccountIcon } from "@/lib/icons";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { accountsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_account: "Conta Bancária",
  cash: "Dinheiro"
};

const ACCOUNT_TYPE_ICONS: Record<string, any> = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Landmark,
  cash: Wallet
};

const PRESET_COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#6b7280", label: "Cinza" }
];

const PRESET_ICONS = [
  { value: "credit-card", label: "Cartão", Icon: CreditCard },
  { value: "landmark", label: "Banco", Icon: Landmark },
  { value: "wallet", label: "Carteira", Icon: Wallet },
  { value: "coins", label: "Moedas", Icon: Coins }
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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState<AccountFormData>(EMPTY_ACCOUNT);
  const [balancesUpdatedAt, setBalancesUpdatedAt] = useState<Date | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  const balanceQueries = useQueries({
    queries: accounts.map((account: any) => ({
      queryKey: ["account-balance", account.id],
      queryFn: () => accountsApi.balance(account.id),
      enabled: !!account.id,
    })),
  });

  const balancesById = balanceQueries.reduce<Record<string, { balance: number; currency: string; transactionCount: number }>>(
    (map, query, index) => {
      const account = accounts[index];
      if (account && query.data) {
        map[account.id] = query.data;
      }
      return map;
    },
    {}
  );

  useEffect(() => {
    if (Object.keys(balancesById).length > 0) {
      setBalancesUpdatedAt(new Date());
    }
  }, [balancesById]);

  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      closeDialog();
      toast({ title: "Conta criada com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      closeDialog();
      toast({ title: "Conta atualizada" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar conta", description: error.message, variant: "destructive" });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: "Conta arquivada" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao arquivar conta", description: error.message, variant: "destructive" });
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
    if (confirm("Arquivar esta conta? As transações existentes não serão afetadas.")) {
      archiveMutation.mutate(id);
    }
  };

  const filtered = accounts.filter((account: any) =>
    account.isActive &&
    (search === "" || account.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getIconComponent = (iconName: string) => {
    const icon = PRESET_ICONS.find(i => i.value === iconName);
    return icon ? icon.Icon : CreditCard;
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contas</h1>
            <p className="text-muted-foreground">Gerencie seus cartões e contas bancárias</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conta..."
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
                  <p className="text-sm text-muted-foreground mb-1">Posição Líquida Simulada</p>
                  <h2 className="text-3xl font-bold text-primary">
                    {(() => {
                      // Calculate: Bank balance - (sum of card balances)
                      const bankAccounts = accounts.filter((a: any) => a.type === "bank_account");
                      const creditCards = accounts.filter((a: any) => a.type === "credit_card");

                      const bankBalance = bankAccounts.reduce((sum: number, a: any) => {
                        const balance = balancesById[a.id]?.balance ?? 0;
                        return sum + balance;
                      }, 0);
                      const cardUsed = creditCards.reduce((sum: number, a: any) => {
                        const balance = balancesById[a.id]?.balance ?? 0;
                        return sum + Math.abs(balance);
                      }, 0);
                      const netPosition = bankBalance - cardUsed;

                      return netPosition.toLocaleString("pt-BR", { style: "currency", currency: "EUR" });
                    })()}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo bancário menos saldos dos cartões
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Saldo calculado</span>
                  </div>
                  {balancesUpdatedAt && (
                    <span className="text-[10px] text-emerald-700">
                      Atualizado {format(balancesUpdatedAt, "HH:mm")}
                    </span>
                  )}
                </div>
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
                {search ? "Nenhuma conta encontrada" : "Nenhuma conta cadastrada"}
              </p>
              {!search && (
                <Button variant="outline" onClick={openCreateDialog} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira conta
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
                          aria-label="Editar conta"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleArchive(account.id)}
                          aria-label="Arquivar conta"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {ACCOUNT_TYPE_LABELS[account.type]}
                      </Badge>
                      {account.lastUploadDate && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Último upload: {new Date(account.lastUploadDate).toLocaleDateString("pt-BR")}
                        </Badge>
                      )}
                      {account.accountNumber && (
                        <span className="text-xs text-muted-foreground">
                          •••• {account.accountNumber}
                        </span>
                      )}
                    </div>

                    {/* Balance */}
                    {balancesById[account.id] ? (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Saldo</span>
                          <span className="text-[10px] text-muted-foreground">
                            Baseado em {balancesById[account.id]?.transactionCount || 0} transações
                          </span>
                        </div>
                        <p className={cn(
                          "text-xl font-bold",
                          (balancesById[account.id]?.balance || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {(balancesById[account.id]?.balance || 0).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        Saldo indisponível (sem transações)
                      </div>
                    )}

                    {/* Credit Card: Limit Bar + Available to Spend */}
                    {account.type === "credit_card" && account.limit && balancesById[account.id] && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Limite</span>
                          <span className="font-medium">
                            {account.limit.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                          </span>
                        </div>

                        {/* Limit Bar */}
                        {(() => {
                          const used = Math.abs(balancesById[account.id]?.balance || 0);
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
                                  {used.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })} usado
                                </span>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-600">
                                    {available.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })} disponível
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
                        Ativa
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Card className="bg-gradient-to-r from-slate-50 to-primary/5 border-primary/10 shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Próximo passo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Revise transações por conta ou importe novos extratos para manter os saldos atualizados.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/transactions">
                <Button variant="outline">Ver transações</Button>
              </Link>
              <Link href="/uploads">
                <Button className="bg-primary hover:bg-primary/90">Importar extrato</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta" : "Nova Conta"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Nubank, Itaú, Amex..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Últimos 4 dígitos (opcional)</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ICONS.map(({ value, label, Icon }) => (
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
                      <span className="text-[10px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLORS.map(({ value, label }) => (
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
                      title={label}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
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
                    <p className="font-medium">{formData.name || "Nome da conta"}</p>
                    <p className="text-xs text-muted-foreground">
                      {ACCOUNT_TYPE_LABELS[formData.type]}
                      {formData.accountNumber && ` • •••• ${formData.accountNumber}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingAccount ? (
                  "Atualizar"
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

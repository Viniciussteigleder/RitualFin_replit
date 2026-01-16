
import { auth } from "@/auth";
import { getAccounts } from "@/lib/actions/accounts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Plus, 
  Wallet, 
  Building2, 
  Coins,
  Settings2,
  PlusCircle,
  PiggyBank
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";

const ICON_MAP: Record<string, any> = {
  credit_card: CreditCard,
  bank_account: Building2,
  debit_card: Wallet,
  cash: Coins,
};

const ACCOUNT_FILTER_MAP: Record<string, string> = {
  "American Express": "Amex",
  "Sparkasse Girokonto": "Sparkasse",
  "Miles & More Gold": "M&M"
};

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver suas contas.</p>
      </div>
    );
  }

  const accounts = await getAccounts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const knownBalances = accounts
    .map((a) => a.balance)
    .filter((b): b is number => typeof b === "number" && Number.isFinite(b));
  const totalKnownBalance = knownBalances.reduce((acc, v) => acc + v, 0);
  const hasAnyKnownBalance = knownBalances.length > 0;

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header Area */}
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
              <AppIcon icon={Wallet} tone="amber" size="lg" />
              <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Carteira Digital</h1>
           </div>
           <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
             Gerencie suas conexões bancárias e cartões. Sua liquidez total em tempo real.
           </p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden lg:flex flex-col items-end mr-2 bg-secondary/30 p-4 rounded-3xl border border-border px-6">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total em Contas</span>
                <span className="text-lg font-bold text-foreground">
                  {hasAnyKnownBalance ? formatCurrency(totalKnownBalance) : "—"}
                </span>
           </div>

           <Link href="/admin/import">
             <Button className="h-14 px-8 bg-foreground text-background hover:scale-105 transition-all rounded-2xl font-bold shadow-xl shadow-foreground/5 gap-2">
               <PlusCircle className="h-5 w-5" />
               Conectar Conta
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col items-center font-sans">
              <div className="w-24 h-24 bg-secondary/50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <PiggyBank className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Nenhuma conta conectada</h3>
              <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
                Para começar a organizar sua vida financeira, você precisa adicionar seus bancos ou cartões.
              </p>
              <Button className="mt-12 h-16 px-12 bg-primary text-white rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95" asChild>
                <Link href="/admin/import">Adicionar Minha Primeira Conta</Link>
              </Button>
            </div>
          </div>
        ) : (
          accounts.map((account) => {
            const Icon = ICON_MAP[account.type] || Wallet;
            const balance = account.balance;
            const hasBalance = typeof balance === "number" && Number.isFinite(balance);

            return (
              <div key={account.id} className="group relative bg-card border border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col gap-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">
                      {account.type === "credit_card" ? "Cartão de Crédito" : "Conta Corrente"}
                    </span>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight font-display group-hover:text-primary transition-colors">{account.name}</h3>
                    <div className="text-[11px] text-muted-foreground font-black tracking-widest mt-1 opacity-60">
                      {account.accountNumber || "**** **** ****"}
                    </div>
                  </div>
                  
                  <div className={cn("p-5 rounded-[1.5rem] text-white shadow-lg transition-all duration-500 group-hover:rotate-6")} style={{ backgroundColor: account.color || "#091E16" }}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                        {account.type === "credit_card" ? "Saldo (sem limite cadastrado)" : "Saldo em Caixa"}
                      </span>
                      <span className="text-3xl font-bold text-foreground tracking-tighter">
                        {hasBalance ? formatCurrency(balance) : "—"}
                      </span>
                    </div>
                    <Link href={`/transactions?accounts=${encodeURIComponent(ACCOUNT_FILTER_MAP[account.name] || account.name)}`}>
                        <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl bg-secondary/50 border-none hover:bg-secondary hover:scale-110 transition-all">
                            <Settings2 className="h-6 w-6 text-muted-foreground" />
                        </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                   <Link href={`/transactions?accounts=${encodeURIComponent(ACCOUNT_FILTER_MAP[account.name] || account.name)}`}>
                       <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-primary p-0 h-auto">Detalhes</Button>
                   </Link>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

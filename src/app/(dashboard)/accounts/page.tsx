
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

const ICON_MAP: Record<string, any> = {
  credit_card: CreditCard,
  bank_account: Building2,
  debit_card: Wallet,
  cash: Coins,
};

export default async function AccountsPage() {
  const accounts = await getAccounts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-7xl mx-auto px-1">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Contas e Cartões</h1>
          <p className="text-muted-foreground font-medium">Gerencie suas conexões bancárias e cartões em um só lugar.</p>
        </div>
        <Button className="h-14 px-8 bg-primary text-white hover:scale-105 transition-all rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2">
          <PlusCircle className="h-5 w-5" />
          Conectar Conta
        </Button>
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
                <a href="#">Adicionar Minha Primeira Conta</a>
              </Button>
            </div>
          </div>
        ) : (
          accounts.map((account) => {
            const Icon = ICON_MAP[account.type] || Wallet;
            // Dummy data for balance and limits as requested for V1 visuals
            const balance = 1250.80; 
            const limit = account.type === "credit_card" ? 5000 : 0;
            const spent = account.type === "credit_card" ? 1250.80 : 0;
            const percentageUsed = limit > 0 ? (spent / limit) * 100 : 0;

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
                  {account.type === "credit_card" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>Utilização do Limite</span>
                        <span>{percentageUsed.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-primary flex items-center justify-end pr-2 rounded-full transition-all duration-1000" 
                           style={{ width: `${percentageUsed}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Gasto: {formatCurrency(spent)}</span>
                        <span>Dispo: {formatCurrency(limit - spent)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{account.type === "credit_card" ? "Fatura Atual" : "Saldo em Caixa"}</span>
                      <span className="text-3xl font-bold text-foreground tracking-tighter">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl bg-secondary/50 border-none hover:bg-secondary hover:scale-110 transition-all">
                      <Settings2 className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

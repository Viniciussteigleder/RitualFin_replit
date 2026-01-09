import { getTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { Receipt, SearchCheck, Sparkles } from "lucide-react";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-1">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Suas Transações</h1>
          <p className="text-muted-foreground font-medium">Explore, filtre e gerencie seu histórico financeiro com precisão.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-3xl border border-border backdrop-blur-sm shadow-sm px-6">
           <div className="flex flex-col items-end mr-2">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Analista IA</span>
             <span className="text-xs font-bold text-foreground">Ativo</span>
           </div>
           <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-background"><Sparkles className="h-4 w-4 text-emerald-500" /></div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-background"><Receipt className="h-4 w-4 text-blue-500" /></div>
           </div>
        </div>
      </div>

      <div className="animate-fade-in-up">
        <TransactionList transactions={transactions.map(tx => ({
          ...tx,
          date: tx.paymentDate,
          description: tx.descNorm || tx.descRaw
        }))} />
      </div>
    </div>
  );
}

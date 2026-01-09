import { getTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { Receipt, SearchCheck, Sparkles } from "lucide-react";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111816] dark:text-white tracking-tight font-display mb-1 text-balance">Suas Transações</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Explore, filtre e gerencie seu histórico financeiro com precisão.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#1a2c26] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse-slow">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white dark:border-[#1a2c26]"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white dark:border-[#1a2c26]"><Receipt className="h-4 w-4 text-blue-600" /></div>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pr-2">Analista Virtual Ativo</span>
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

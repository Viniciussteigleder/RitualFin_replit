import { getPendingTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "../transactions/transaction-list";
import { Info, CheckCircle2, SearchCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ConfirmPage() {
  const transactions = await getPendingTransactions();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111816] dark:text-white tracking-tight font-display mb-1">Fila de Revisão</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Confirme ou categorize as transações que precisam da sua atenção.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#1a2c26] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="px-4 py-2 bg-primary/10 rounded-xl">
             <span className="text-xs font-black text-primary-dark dark:text-primary uppercase tracking-widest">{transactions.length} Pendentes</span>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-[#1a2c26] border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-32"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-primary/20 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-6 hover:rotate-0 transition-transform duration-500">
               <CheckCircle2 className="h-12 w-12 text-primary-dark" />
            </div>
            <h3 className="text-2xl font-black text-[#111816] dark:text-white mb-2">Tudo em ordem!</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-[320px] font-medium leading-snug">
              Você revisou todas as suas transações. Sua saúde financeira está em dia.
            </p>
            <Button className="mt-10 h-14 px-10 bg-[#111816] dark:bg-primary text-white dark:text-[#111816] rounded-2xl font-black transition-all shadow-lg hover:scale-105 active:scale-95">
              Voltar ao Painel
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">
           <TransactionList transactions={transactions.map(tx => ({
            ...tx,
            date: tx.paymentDate, // Normalize for the component
            description: tx.descNorm || tx.descRaw
          }))} />
        </div>
      )}
    </div>
  );
}

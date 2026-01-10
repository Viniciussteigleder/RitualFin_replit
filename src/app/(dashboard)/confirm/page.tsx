import { getPendingTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "../transactions/transaction-list";
import { Info, CheckCircle2, SearchCheck, Sparkles, Brain, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BulkConfirmButton } from "@/components/transactions/bulk-confirm-button";

export default async function ConfirmPage() {
  const transactions = await getPendingTransactions();
  const highConfidenceCount = transactions.filter(tx => (tx.confidence || 0) >= 80).length;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 font-sans px-1">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Sugestões de IA</h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
            Sua IA classificou <span className="text-foreground font-bold">{transactions.length} lançamentos</span> automaticamente. 
            Valide as sugestões para manter sua análise precisa.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-3xl border border-border shadow-inner px-6">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">IA Automação</span>
              <span className="text-xs font-bold text-foreground text-emerald-500">Ativo</span>
            </div>
            <Switch checked className="data-[state=checked]:bg-emerald-500" />
          </div>

          <BulkConfirmButton count={highConfidenceCount} />
        </div>
      </div>

      {/* Stats Grid - Matching Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
             <Zap className="h-16 w-16" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pendentes de Revisão</span>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground tracking-tighter font-display">{transactions.length}</span>
            <span className="text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Lançamentos</span>
          </div>
        </div>
        
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2 group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alta Confiança</span>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-emerald-500 tracking-tighter font-display">{highConfidenceCount}</span>
            <div className="flex flex-col mb-1.5">
               <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Prontos p/ Aprovar</span>
               <div className="w-16 h-1 bg-emerald-100 rounded-full mt-1 overflow-hidden">
                 <div className="w-full h-full bg-emerald-500"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2 group hover:shadow-md transition-shadow bg-gradient-to-br from-white to-secondary/20">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Precisão Global</span>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground tracking-tighter font-display">88%</span>
            <span className="text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Média Mensal</span>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-primary text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-700">
               <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Tudo em ordem!</h3>
            <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
              Você revisou todas as sugestões da Inteligência Artificial. Seus dados estão 100% atualizados.
            </p>
            <Button className="mt-12 h-16 px-12 bg-foreground text-background rounded-2xl font-bold transition-all shadow-xl hover:opacity-90 active:scale-95 text-base" asChild>
              <a href="/">Voltar ao Painel</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-2">
             <TransactionList transactions={transactions.map(tx => ({
              ...tx,
              date: tx.paymentDate, // Normalize for the component
              description: tx.descNorm || tx.descRaw
            }))} />
           </div>
        </div>
      )}
    </div>
  );
}

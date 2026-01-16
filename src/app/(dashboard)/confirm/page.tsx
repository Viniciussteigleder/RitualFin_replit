import { auth } from "@/auth";
import { getPendingTransactions } from "@/lib/actions/transactions";
import { getTaxonomyOptions } from "@/lib/actions/discovery";
import { TransactionList } from "../transactions/transaction-list";
import { CheckCircle2, Zap, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkConfirmButton } from "@/components/transactions/bulk-confirm-button";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";
import Link from "next/link";
import { ConfirmTabs } from "@/components/confirm/confirm-tabs";

export default async function ConfirmPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para acessar a fila de revisão.</p>
      </div>
    );
  }

  const transactions = await getPendingTransactions();
  const highConfidenceCount = transactions.filter(tx => (tx.confidence || 0) >= 80).length;
  const taxonomyOptions = await getTaxonomyOptions();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-32 font-sans px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Discovery de Regras</h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
            Identifique padrões em transações não categorizadas (OPEN) e crie regras inteligentes para o futuro.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
           <ReRunRulesButton />
        </div>
      </div>

      <ConfirmTabs taxonomyOptions={taxonomyOptions} />

      {/* Legacy Review Section - High Confidence Matches */}
      {transactions.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-dashed">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Revisão de Alta Confiança
                    </h2>
                    <p className="text-muted-foreground">Confirme as sugestões onde a IA tem mais de 80% de certeza.</p>
                </div>
                {highConfidenceCount > 0 && <BulkConfirmButton count={highConfidenceCount} />}
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-2">
                <TransactionList transactions={transactions.map(tx => ({
                ...tx,
                date: tx.paymentDate, 
                 description: tx.descNorm || tx.descRaw
                }))} />
            </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mt-40 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-primary text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-700">
               <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Tudo limpo!</h3>
            <p className="text-muted-foreground max-w-[360px] font-medium leading-relaxed px-6">
              Não há revisões pendentes no momento. Use as abas acima para regras (OPEN), recorrentes e conflitos.
            </p>
            <Button className="mt-12 h-16 px-12 bg-foreground text-background rounded-2xl font-bold transition-all shadow-xl hover:opacity-90 active:scale-95 text-base" asChild>
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

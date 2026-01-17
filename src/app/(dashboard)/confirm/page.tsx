import { auth } from "@/auth";
import { getPendingTransactions } from "@/lib/actions/transactions";
import { getTaxonomyOptions } from "@/lib/actions/discovery";
import { TransactionList } from "../transactions/transaction-list";
import { CheckCircle2, Zap, BrainCircuit } from "lucide-react";
import { BulkConfirmButton } from "@/components/transactions/bulk-confirm-button";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";
import { ConfirmTabs } from "@/components/confirm/confirm-tabs";
import { PageHeader, PageContainer, EmptyState } from "@/components/ui/page-header";

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
    <PageContainer className="max-w-6xl">
      <PageHeader
        icon={BrainCircuit}
        iconColor="primary"
        title="Discovery de Regras"
        subtitle="Identifique padrões em transações não categorizadas (OPEN) e crie regras inteligentes para o futuro."
        actions={<ReRunRulesButton />}
      />

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
        <EmptyState
          icon={CheckCircle2}
          title="Tudo limpo!"
          description="Não há revisões pendentes no momento. Use as abas acima para regras (OPEN), recorrentes e conflitos."
          action={{ label: "Voltar ao Dashboard", href: "/" }}
        />
      )}
    </PageContainer>
  );
}

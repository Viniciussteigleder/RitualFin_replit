import { auth } from "@/auth";
import { getTransactions, getAliases } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { AIAnalystChat } from "@/components/transactions/AIAnalystChat";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";
import { Wallet } from "lucide-react";
import { AppIcon } from "@/components/ui/app-icon";

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; needsReview?: string; accounts?: string | string[] }>
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver suas transações.</p>
      </div>
    );
  }

  const params = await searchParams;
  const sources = params.accounts ? (Array.isArray(params.accounts) ? params.accounts : [params.accounts]) : undefined;
  const transactions = await getTransactions({ limit: sources?.length ? 1200 : 2000, sources });
  const aliases = await getAliases();

  const aliasMap = aliases.reduce((acc, alias) => {
    if (alias.logoUrl && alias.aliasDesc) acc[alias.aliasDesc] = alias.logoUrl;
    return acc;
  }, {} as Record<string, string>);

  const initialFilters = {
    categories: params.category ? [params.category] : undefined,
    accounts: sources,
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1">
      {/* Header Section - Premium Card Style */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AppIcon icon={Wallet} tone="violet" size="lg" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Extrato</h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
            Explore, filtre e gerencie seu histórico financeiro com precisão.
          </p>
        </div>

        <div className="flex items-center gap-3">
             <ReRunRulesButton />
             <AIAnalystChat />
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <TransactionList
          transactions={transactions.map(tx => ({
            ...tx,
            date: tx.paymentDate,
            description: tx.descNorm || tx.descRaw
          }))}
          initialFilters={initialFilters}
          aliasMap={aliasMap}
        />
      </div>
    </div>
  );
}

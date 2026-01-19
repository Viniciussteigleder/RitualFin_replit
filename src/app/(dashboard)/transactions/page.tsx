import { auth } from "@/auth";
import { getTransactionsForList, getAliasesForTransactions, getFilterOptions } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { AIAnalystChat } from "@/components/transactions/AIAnalystChat";
import { ReRunRulesButton } from "@/components/transactions/re-run-rules-button";
import { Wallet } from "lucide-react";
import { PageHeader, PageContainer } from "@/components/ui/page-header";

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

  // Fetch transactions and filter options in parallel - M1/M10 fix
  const [transactionsResult, filterOptions, aliasMapResult] = await Promise.all([
    getTransactionsForList({ limit: 50, sources }),
    getFilterOptions(),
    Promise.resolve(null) // Placeholder, aliasMap fetched after
  ]);

  const { items: transactions, hasMore, nextCursor } = transactionsResult;

  // PERFORMANCE: Only fetch aliases for visible transactions (80% smaller payload)
  const aliasMap = await getAliasesForTransactions(transactions);

  const initialFilters = {
    categories: params.category ? [params.category] : undefined,
    accounts: sources,
  };

  return (
    <PageContainer>
      <PageHeader
        icon={Wallet}
        iconColor="violet"
        title="Extrato"
        subtitle="Explore, filtre e gerencie seu histórico financeiro com precisão."
        actions={
          <div className="flex items-center gap-3">
            <ReRunRulesButton />
            <AIAnalystChat />
          </div>
        }
      />

      <TransactionList
        transactions={transactions.map((tx: any) => ({
          ...tx,
          date: tx.paymentDate,
          description: tx.descNorm || tx.descRaw
        }))}
        initialFilters={initialFilters}
        aliasMap={aliasMap}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
        allCategories={filterOptions.categories as string[]}
        allAccounts={filterOptions.accounts as string[]}
      />
    </PageContainer>
  );
}

export const dynamic = 'force-dynamic';

import { getTransactions, getAliases } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { AIAnalystChat } from "@/components/transactions/AIAnalystChat";

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; needsReview?: string }>
}) {
  const params = await searchParams;
  const transactions = await getTransactions();
  const aliases = await getAliases();

  const aliasMap = aliases.reduce((acc, alias) => {
    if (alias.logoUrl && alias.aliasDesc) acc[alias.aliasDesc] = alias.logoUrl;
    return acc;
  }, {} as Record<string, string>);
  
  const initialFilters = {
    categories: params.category ? [params.category] : undefined,
    // Add logic for needsReview if filter-panel supports it, otherwise logic handles it elsewhere
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-1">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-display">Suas Transações</h1>
          <p className="text-muted-foreground font-medium">Explore, filtre e gerencie seu histórico financeiro com precisão.</p>
        </div>
        
        <AIAnalystChat />
      </div>

      <div className="animate-fade-in-up">
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

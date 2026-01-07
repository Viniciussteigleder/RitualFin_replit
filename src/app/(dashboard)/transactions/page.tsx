import { getTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";
import { PageHeader } from "@/components/ui/page-header";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transactions" 
        description="Scan, filter, and manage your financial records."
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Transactions" }
        ]}
      />

      <TransactionList transactions={transactions.map(tx => ({
        ...tx,
        date: tx.paymentDate,
        description: tx.descNorm || tx.descRaw
      }))} />
    </div>
  );
}

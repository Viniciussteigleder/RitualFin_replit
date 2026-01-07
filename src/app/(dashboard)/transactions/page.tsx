import { getTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "./transaction-list";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>

      <TransactionList transactions={transactions.map(tx => ({
        ...tx,
        date: tx.paymentDate,
        description: tx.descNorm || tx.descRaw
      }))} />
    </div>
  );
}

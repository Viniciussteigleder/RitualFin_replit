
import { getPendingTransactions } from "@/lib/actions/transactions";
import { TransactionList } from "../transactions/transaction-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function ConfirmPage() {
  const transactions = await getPendingTransactions();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">Confirm or categorize transactions that require your attention.</p>
        </div>
      </div>

      {transactions.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800 font-semibold">Verification Required</AlertTitle>
          <AlertDescription className="text-blue-700">
            You have {transactions.length} transactions waiting for review. These are either new imports or low-confidence matches.
          </AlertDescription>
        </Alert>
      )}

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <h3 className="text-lg font-semibold">Tudo em dia!</h3>
          <p className="text-muted-foreground mt-2">Você confirmou todas as transações recentes.</p>
        </div>
      ) : (
        <TransactionList transactions={transactions.map(tx => ({
          ...tx,
          date: tx.paymentDate, // Normalize for the component
          description: tx.descNorm || tx.descRaw
        }))} />
      )}
    </div>
  );
}

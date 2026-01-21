"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Activity } from "lucide-react";
import { ReviewButton } from "./review-button";
import { Drawer } from "@/components/ui/drawer";
import { TransactionDetailContent } from "@/components/transactions/transaction-detail-content";

interface RecentTransactionsListProps {
  transactions: any[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  const [selectedTx, setSelectedTx] = useState<any>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
        <Activity className="h-8 w-8 mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest">Tudo limpo por aqui</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between group/item cursor-pointer hover:bg-secondary p-4 rounded-3xl transition-[background-color,color,box-shadow,opacity] duration-150"
            onClick={() => setSelectedTx(tx)}
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground truncate max-w-[200px] tracking-tight">
                {tx.descNorm || tx.descRaw}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {formatCurrency(Math.abs(Number(tx.amount)), { hideDecimals: true })}
              </span>
            </div>
            {/* 
                Stop propagation on the review button so clicking it 
                performs the action without opening the drawer if that's preferred.
                Or keep it as is. 
                But ReviewButton is a client component that calls a server action.
                It might conflict if we are not careful.
                Let's wrap it in a div that stops propagation.
            */}
            <div onClick={(e) => e.stopPropagation()}>
               <ReviewButton transactionId={tx.id} />
            </div>
          </div>
        ))}
      </div>

      <Drawer open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
         <TransactionDetailContent 
            transaction={selectedTx} 
            onClose={() => setSelectedTx(null)}
            onConfirm={(id) => {
                // If the confirmed transaction is the one currently open, close the drawer
                if (selectedTx?.id === id) setSelectedTx(null);
            }}
         />
      </Drawer>
    </>
  );
}

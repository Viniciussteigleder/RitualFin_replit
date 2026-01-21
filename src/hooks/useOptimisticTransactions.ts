/**
 * useOptimistic wrapper for transaction updates
 * Provides optimistic UI updates with automatic rollback on error
 */

'use client';

import { useOptimistic, useTransition } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  descNorm: string;
  category1?: string;
  needsReview: boolean;
  [key: string]: any;
}

export function useOptimisticTransactions(initialTransactions: Transaction[]) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTransactions, setOptimisticTransactions] = useOptimistic(
    initialTransactions,
    (state, update: { action: 'update' | 'delete'; transaction: Transaction }) => {
      switch (update.action) {
        case 'update':
          return state.map(t =>
            t.id === update.transaction.id ? update.transaction : t
          );
        case 'delete':
          return state.filter(t => t.id !== update.transaction.id);
        default:
          return state;
      }
    }
  );

  const updateTransaction = async (
    transaction: Transaction,
    serverAction: (transaction: Transaction) => Promise<void>
  ) => {
    startTransition(async () => {
      setOptimisticTransactions({ action: 'update', transaction });
      
      try {
        await serverAction(transaction);
      } catch (error) {
        // Rollback happens automatically
        console.error('Failed to update transaction:', error);
        throw error;
      }
    });
  };

  const deleteTransaction = async (
    transaction: Transaction,
    serverAction: (id: string) => Promise<void>
  ) => {
    startTransition(async () => {
      setOptimisticTransactions({ action: 'delete', transaction });
      
      try {
        await serverAction(transaction.id);
      } catch (error) {
        // Rollback happens automatically
        console.error('Failed to delete transaction:', error);
        throw error;
      }
    });
  };

  return {
    transactions: optimisticTransactions,
    isPending,
    updateTransaction,
    deleteTransaction,
  };
}

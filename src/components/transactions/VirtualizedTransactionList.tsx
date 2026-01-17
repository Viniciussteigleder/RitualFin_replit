"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TransactionRow } from "./TransactionRow";
import { Checkbox } from "@/components/ui/checkbox";

interface VirtualizedTransactionListProps {
  groupedTransactions: Record<string, any[]>;
  sortedDateKeys: string[];
  isCompact: boolean;
  hideCents: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEditClick: (tx: any) => void;
  onClick: (tx: any) => void;
  aliasMap: Record<string, string>;
}

export function VirtualizedTransactionList({
  groupedTransactions,
  sortedDateKeys,
  isCompact,
  hideCents,
  selectedIds,
  onToggleSelect,
  onEditClick,
  onClick,
  aliasMap,
}: VirtualizedTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all transactions with date headers
  const flatItems = sortedDateKeys.flatMap((dateKey) => {
    const txs = groupedTransactions[dateKey];
    return [
      { type: "header" as const, dateKey, id: `header-${dateKey}` },
      ...txs.map((tx) => ({ type: "transaction" as const, data: tx, id: tx.id })),
    ];
  });

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flatItems[index];
      if (item.type === "header") return 60; // Date header height
      return isCompact ? 60 : 80; // Transaction row height
    },
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="bg-card border border-border border-t-0 rounded-b-3xl overflow-auto shadow-sm"
      style={{ height: "calc(100vh - 400px)", minHeight: "500px" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = flatItems[virtualItem.index];

          if (item.type === "header") {
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="px-6 py-4 bg-secondary/30 border-b border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {new Date(item.dateKey).toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {groupedTransactions[item.dateKey].length} transações
                  </span>
                </div>
              </div>
            );
          }

          const tx = item.data;
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TransactionRow
                transaction={tx}
                isCompact={isCompact}
                hideCents={hideCents}
                isSelected={selectedIds.has(tx.id)}
                onToggleSelect={() => onToggleSelect(tx.id)}
                onEditClick={() => onEditClick(tx)}
                onClick={() => onClick(tx)}
                aliasMap={aliasMap}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

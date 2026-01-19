"use client";

import { TransactionRow } from "./TransactionRow";

interface TransactionGroupProps {
    dateKey: string;
    transactions: any[];
    isCompact: boolean;
    hideCents: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string, e: any) => void;
    onEditClick: (tx: any, e: any) => void;
    onClick: (tx: any) => void;
    aliasMap?: Record<string, string>;
}

export function TransactionGroup({
    dateKey,
    transactions,
    isCompact,
    hideCents,
    selectedIds,
    onToggleSelect,
    onEditClick,
    onClick,
    aliasMap
}: TransactionGroupProps) {
    const displayDate = new Date(dateKey).toLocaleDateString(undefined, { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });

    return (
        <div className="contents">
            <div className="bg-secondary/80 px-6 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest sticky top-0 z-10 border-y border-border/50">
                {displayDate}
            </div>
            {transactions.map((tx) => (
                <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    isCompact={isCompact}
                    hideCents={hideCents}
                    isSelected={selectedIds.has(tx.id)}
                    onToggleSelect={onToggleSelect}
                    onEditClick={onEditClick}
                    onClick={onClick}
                    aliasMap={aliasMap}
                />
            ))}
        </div>
    );
}

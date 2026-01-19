"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit3, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    formatDate,
    formatAmount
} from "@/lib/utils/transaction-formatters";
import { CategoryIcon } from "@/components/ui/category-icon";

interface TransactionRowProps {
    transaction: any;
    isCompact?: boolean;
    hideCents?: boolean;
    isSelected?: boolean;
    onToggleSelect: (id: string, e: React.MouseEvent | React.FormEvent) => void;
    onEditClick: (tx: any, e: React.MouseEvent) => void;
    onClick: (tx: any) => void;
    aliasMap?: Record<string, string>;
}

// Memoized to prevent unnecessary re-renders
export const TransactionRow = memo(function TransactionRow({
    transaction,
    isCompact = false,
    hideCents = false,
    isSelected = false,
    onToggleSelect,
    onEditClick,
    onClick,
    aliasMap = {}
}: TransactionRowProps) {
    const isNegative = Number(transaction.amount) < 0;

    return (
        <div
            className={cn(
                "group flex flex-col md:grid md:grid-cols-[40px_80px_2.5fr_1fr_2fr_80px_80px] gap-2 md:gap-3 items-stretch md:items-center hover:bg-secondary/40 transition-all duration-200 cursor-pointer border-transparent",
                isCompact ? "px-4 py-2 md:px-6" : "px-4 py-4 md:px-6",
                isSelected && "bg-primary/5 border-l-4 border-l-primary"
            )}
            onClick={() => onClick(transaction)}
        >
            {/* Column: Checkbox */}
            <div className="hidden md:flex justify-center" onClick={(e) => {
                e.stopPropagation();
            }}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(transaction.id, { preventDefault: () => {}, stopPropagation: () => {} } as any)}
                    className="h-4 w-4 rounded border-2"
                />
            </div>

            {/* Column: Date (DD.MM.YY format, no time) */}
            <div className="hidden md:flex items-center text-xs font-medium text-muted-foreground">
                {formatDate(transaction.date)}
            </div>

            {/* Mobile: Top Row with Avatar, Name, Amount */}
            <div className="flex items-center gap-3 w-full md:contents">
                {/* Mobile Checkbox */}
                <div className="md:hidden" onClick={(e) => {
                    e.stopPropagation();
                }}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(transaction.id, { preventDefault: () => {}, stopPropagation: () => {} } as any)}
                        className="h-4 w-4 rounded border-2"
                    />
                </div>

                {/* Logo/Avatar - Rectangle/flexible */}
                <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                    {transaction.aliasDesc && aliasMap[transaction.aliasDesc] ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={aliasMap[transaction.aliasDesc]}
                                alt={transaction.aliasDesc}
                                loading="lazy"
                                className={cn(
                                    "object-contain border border-border bg-white flex-shrink-0 rounded-lg",
                                    isCompact ? "w-8 h-8" : "w-10 h-8"
                                )}
                            />
                        </>
                    ) : (
                        <CategoryIcon
                            category={transaction.category1}
                            size={isCompact ? "sm" : "md"}
                        />
                    )}

                    {/* Description & Source */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                            <span className={cn(
                                "text-foreground tracking-tight line-clamp-1 font-medium",
                                isCompact ? "text-sm" : "text-sm"
                            )}>
                                {transaction.aliasDesc || transaction.description || transaction.descRaw}
                            </span>

                            {/* Amount (Mobile Only) */}
                            <div className={cn(
                                "md:hidden text-sm font-semibold tracking-tight whitespace-nowrap",
                                isNegative ? "text-red-600" : "text-emerald-600"
                            )}>
                                {isNegative ? "-" : "+"} {formatAmount(Number(transaction.amount), hideCents)}
                            </div>
                        </div>

                        {/* Mobile info badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs md:hidden">
                            <span className="text-[10px] text-muted-foreground">{formatDate(transaction.date)}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">{transaction.category1 || "N/A"}</span>
                            {transaction.conflictFlag && (
                                <Badge className="h-4 px-1 rounded bg-red-100 text-red-700 border-none text-[8px]">
                                    <AlertCircle className="w-3 h-3 mr-0.5" />
                                    Conflito
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop Amount */}
                <div className={cn(
                    "hidden md:flex items-center font-semibold",
                    isNegative ? "text-red-600" : "text-emerald-600"
                )}>
                    {isNegative ? "-" : "+"} {formatAmount(Number(transaction.amount), hideCents)}
                </div>

                {/* Desktop Classification (Merged) */}
                <div className="hidden md:flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0">
                         <div className="flex items-center justify-center p-2 rounded-xl bg-secondary/30 border border-border">
                            <CategoryIcon category={transaction.appCategoryName || transaction.category1 || "OPEN"} size="sm" />
                         </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">
                            {transaction.appCategoryName || "Sem categoria"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                             <span className="truncate">{transaction.category1 || "-"}</span>
                             {transaction.category2 && (
                                <>
                                    <span>›</span>
                                    <span className="truncate text-muted-foreground/80">{transaction.category2}</span>
                                </>
                             )}
                        </div>
                    </div>
                </div>

                {/* Action Button - Edit only (opens drawer) */}
                <div className="hidden md:flex items-center justify-center">
                    <button
                        className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95"
                        onClick={(e) => onEditClick(transaction, e)}
                        title="Editar transação"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}, (prevProps: TransactionRowProps, nextProps: TransactionRowProps) => {
    // Custom comparison function for performance
    return (
        prevProps.transaction.id === nextProps.transaction.id &&
        prevProps.transaction.date === nextProps.transaction.date &&
        prevProps.transaction.amount === nextProps.transaction.amount &&
        prevProps.transaction.category1 === nextProps.transaction.category1 &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isCompact === nextProps.isCompact &&
        prevProps.hideCents === nextProps.hideCents &&
        prevProps.aliasMap === nextProps.aliasMap
    );
});

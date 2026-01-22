"use client";

import { TopAggregateRow } from "@/lib/actions/analytics";
import { MerchantList } from "./merchant-list";

interface RecurringListProps {
  data: TopAggregateRow[];
}

export function RecurringList({ data }: RecurringListProps) {
  return (
    <MerchantList 
        data={data} 
        title="Gastos Recorrentes" 
    />
  );
}

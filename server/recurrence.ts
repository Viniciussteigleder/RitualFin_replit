import crypto from "node:crypto";
import type { Transaction } from "@shared/schema";
import type { IStorage } from "./storage";

function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function amountSimilar(base: number, value: number) {
  const tolerance = Math.max(2, Math.abs(base) * 0.02);
  return Math.abs(base - value) <= tolerance;
}

export async function updateRecurringGroups(
  storage: IStorage,
  userId: string,
  keyDescs: string[]
) {
  const unique = Array.from(new Set(keyDescs));

  for (const keyDesc of unique) {
    const txs = await storage.getTransactionsByKeyDesc(userId, keyDesc);
    if (txs.length < 3) continue;

    const sorted = [...txs].sort((a, b) => new Date(a.bookingDate || a.paymentDate).getTime() - new Date(b.bookingDate || b.paymentDate).getTime());
    const baseAmount = sorted[0].amount || 0;

    const deltas: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].bookingDate || sorted[i - 1].paymentDate);
      const curr = new Date(sorted[i].bookingDate || sorted[i].paymentDate);
      if (amountSimilar(baseAmount, sorted[i].amount || 0)) {
        deltas.push(daysBetween(curr, prev));
      }
    }

    const validDeltas = deltas.filter(d => d >= 26 && d <= 34);
    if (validDeltas.length < 2) continue;

    const recurringGroupId = sorted.find(t => t.recurringGroupId)?.recurringGroupId || crypto.randomUUID();
    const days = sorted.map(t => new Date(t.bookingDate || t.paymentDate).getDate());
    const dayMedian = Math.round(median(days));
    const dayWindow = Math.max(...days.map(d => Math.abs(d - dayMedian)));
    const confidence = validDeltas.length / deltas.length;

    await storage.updateTransactionsByKeyDesc(userId, keyDesc, {
      recurringFlag: true,
      recurringGroupId,
      recurringConfidence: confidence,
      recurringDayOfMonth: dayMedian,
      recurringDayWindow: Math.max(dayWindow, 1)
    } as Partial<Transaction>);
  }
}

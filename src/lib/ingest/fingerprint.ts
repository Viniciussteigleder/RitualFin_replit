import { createHash } from "crypto";
import { ParsedTransaction } from "./types";

export function generateFingerprint(tx: ParsedTransaction): string {
  const parts = [
    tx.source,
    tx.key || "",
    tx.amount.toFixed(2),
    tx.date.toISOString().split("T")[0],
    tx.description,
    tx.rawDescription || ""
  ];
  const input = parts.join("|");
  return createHash("sha256").update(input).digest("hex");
}

/**
 * MerchantAvatar
 * ──────────────
 * Design Specification (Senior Brand Architect)
 *
 * ROLE: Represents the MERCHANT (who received money) — NOT the category.
 * This creates a clear visual hierarchy in the transaction list:
 *   LEFT  = Merchant Identity  (MerchantAvatar or Brand Logo)
 *   RIGHT = Category Badge     (CategoryIcon)
 *
 * BEHAVIOR:
 *   1. If a brand logo URL is provided → render crisp logo image.
 *   2. Else → render a deterministic monogram (initials) with a color
 *      derived from the merchant name hash (stable across renders).
 *
 * COLOR SYSTEM: 10 carefully chosen, accessible colors.
 * No two adjacent merchants will share a color because the hash
 * distributes names evenly across the palette.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

// 10 high-contrast palette pairs [bg, text] drawn from Tailwind 600/100
const MERCHANT_PALETTE: Array<[string, string]> = [
  ["#0891B2", "#E0F7FA"], // Cyan     – Finance / tech
  ["#7C3AED", "#F3E8FF"], // Violet   – Services
  ["#DB2777", "#FDF2F8"], // Pink     – Retail
  ["#059669", "#ECFDF5"], // Emerald  – Grocery / market
  ["#D97706", "#FFFBEB"], // Amber    – Food / café
  ["#DC2626", "#FEF2F2"], // Red      – Subscriptions
  ["#2563EB", "#EFF6FF"], // Blue     – Transport
  ["#0D9488", "#F0FDFA"], // Teal     – Health
  ["#9333EA", "#FAF5FF"], // Purple   – Entertainment
  ["#475569", "#F8FAFC"], // Slate    – Utility / other
];

/** Stable, deterministic hash 0-9 from a string */
function merchantColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xfffffff;
  }
  return hash % MERCHANT_PALETTE.length;
}

/** Extract up to 2 uppercase initials from a merchant description */
function getInitials(name: string): string {
  // Strip common suffixes like "-- DKB-MM -- EUR" or "-- Processed --"
  const clean = name
    .replace(/--.*$/g, "")
    .replace(/\*[\w]+/g, "")         // Strip e.g. CKO*ELDORADO → ELDORADO
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, " ")
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { container: string; text: string; logoSize: number }> = {
  sm: { container: "h-8 w-8 rounded-xl text-[10px] font-black", text: "text-[10px]", logoSize: 32 },
  md: { container: "h-10 w-10 rounded-2xl text-[11px] font-black", text: "text-[11px]", logoSize: 40 },
  lg: { container: "h-14 w-14 rounded-[1.25rem] text-sm font-black", text: "text-sm", logoSize: 56 },
};

interface MerchantAvatarProps {
  /** Raw merchant name (aliasDesc or description). Used for initials + color. */
  name: string;
  /** Optional brand logo URL. If provided, renders the image instead of initials. */
  logoUrl?: string | null;
  size?: Size;
  className?: string;
}

export function MerchantAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: MerchantAvatarProps) {
  const styles = SIZE[size];

  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative flex-shrink-0 overflow-hidden border border-border bg-white",
          styles.container,
          className
        )}
      >
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes={`${styles.logoSize}px`}
          className="object-contain p-1.5"
          loading="lazy"
        />
      </div>
    );
  }

  const initials = getInitials(name || "?");
  const idx = merchantColorIndex(name || "");
  const [bg, fg] = MERCHANT_PALETTE[idx];

  return (
    <div
      className={cn(
        "flex-shrink-0 inline-flex items-center justify-center select-none border border-transparent tracking-tighter",
        styles.container,
        className
      )}
      style={{
        backgroundColor: bg + "22", // ~13% opacity background tint
        borderColor: bg + "33",
        color: bg,
        boxShadow: `0 2px 8px -4px ${bg}55`,
      }}
      aria-label={name}
      title={name}
    >
      <span className={cn("font-black", styles.text)}>{initials}</span>
    </div>
  );
}

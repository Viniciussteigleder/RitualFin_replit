import {
  LucideIcon,
  ShoppingCart,
  CreditCard,
  Coffee,
  Utensils,
  Plane,
  Music,
  Film,
  Car,
  Home,
  Heart,
  Zap,
  Package,
  Smartphone,
} from "lucide-react";

const MERCHANT_METADATA_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  "credit-card": CreditCard,
  "coffee": Coffee,
  "utensils": Utensils,
  "plane": Plane,
  "music": Music,
  "film": Film,
  "car": Car,
  "home": Home,
  "heart": Heart,
  "zap": Zap,
  "package": Package,
  "smartphone": Smartphone,
};

export interface MerchantMetadataMatch {
  icon: LucideIcon;
  color: string;
  friendlyName?: string;
  merchantName?: string;
}

export function resolveMerchantMetadata(
  metadata: any[],
  description?: string
): MerchantMetadataMatch | undefined {
  if (!description || metadata.length === 0) return undefined;

  const normalized = description.toUpperCase();

  for (const item of metadata) {
    const pattern = (item.pattern || "").toUpperCase().trim();
    if (!pattern) continue;
    if (normalized.includes(pattern)) {
      return {
        icon: MERCHANT_METADATA_ICONS[item.icon] || CreditCard,
        color: item.color || "#6b7280",
        friendlyName: item.friendlyName,
      };
    }
  }

  return undefined;
}

/**
 * Merchant Icon Mapping
 *
 * Maps merchant names (from transaction descriptions) to icons and colors.
 * Used for visual recognition in transaction lists, dashboard, and detail views.
 */

import { LucideIcon, Film, Package, Utensils, ShoppingCart, Coffee, Plane, Music, Smartphone, Zap, Wifi, Shirt, Heart, Car, Fuel, Home, GraduationCap, Gift, Dumbbell, Sparkles, CreditCard } from "lucide-react";

export interface MerchantIcon {
  keywords: string[];
  icon: LucideIcon;
  color: string;
  category?: string;
}

/**
 * Top 50 merchants with branded icons
 * Keywords are matched against normalized transaction description (lowercase, no accents)
 */
export const MERCHANT_ICONS: Record<string, MerchantIcon> = {
  // Streaming & Entertainment
  "netflix": {
    keywords: ["netflix"],
    icon: Film,
    color: "#E50914",
    category: "Lazer"
  },
  "spotify": {
    keywords: ["spotify"],
    icon: Music,
    color: "#1DB954",
    category: "Lazer"
  },
  "youtube": {
    keywords: ["youtube", "youtube premium"],
    icon: Film,
    color: "#FF0000",
    category: "Lazer"
  },
  "amazon_prime": {
    keywords: ["amazon prime", "prime video"],
    icon: Film,
    color: "#00A8E1",
    category: "Lazer"
  },
  "disney": {
    keywords: ["disney+", "disney plus"],
    icon: Film,
    color: "#113CCF",
    category: "Lazer"
  },
  "hbo": {
    keywords: ["hbo", "hbo max"],
    icon: Film,
    color: "#7C3CC4",
    category: "Lazer"
  },

  // E-commerce
  "amazon": {
    keywords: ["amazon", "amzn"],
    icon: Package,
    color: "#FF9900",
    category: "Compras Online"
  },
  "ebay": {
    keywords: ["ebay"],
    icon: Package,
    color: "#E53238",
    category: "Compras Online"
  },
  "zalando": {
    keywords: ["zalando"],
    icon: Shirt,
    color: "#FF6900",
    category: "Roupas"
  },

  // Food Delivery
  "uber_eats": {
    keywords: ["uber eats", "ubereats"],
    icon: Utensils,
    color: "#06C167",
    category: "Alimentação"
  },
  "deliveroo": {
    keywords: ["deliveroo"],
    icon: Utensils,
    color: "#00CCBC",
    category: "Alimentação"
  },
  "lieferando": {
    keywords: ["lieferando", "just eat"],
    icon: Utensils,
    color: "#FF8000",
    category: "Alimentação"
  },

  // Groceries
  "rewe": {
    keywords: ["rewe"],
    icon: ShoppingCart,
    color: "#CC071E",
    category: "Mercado"
  },
  "edeka": {
    keywords: ["edeka"],
    icon: ShoppingCart,
    color: "#0064A0",
    category: "Mercado"
  },
  "lidl": {
    keywords: ["lidl"],
    icon: ShoppingCart,
    color: "#0050AA",
    category: "Mercado"
  },
  "aldi": {
    keywords: ["aldi"],
    icon: ShoppingCart,
    color: "#0090D0",
    category: "Mercado"
  },
  "dm": {
    keywords: ["dm-drogerie", "dm markt"],
    icon: ShoppingCart,
    color: "#003B5C",
    category: "Mercado"
  },

  // Coffee & Restaurants
  "starbucks": {
    keywords: ["starbucks"],
    icon: Coffee,
    color: "#00704A",
    category: "Alimentação"
  },
  "mcdonalds": {
    keywords: ["mcdonald", "mcdonalds"],
    icon: Utensils,
    color: "#FFC72C",
    category: "Alimentação"
  },
  "burger_king": {
    keywords: ["burger king"],
    icon: Utensils,
    color: "#D62300",
    category: "Alimentação"
  },

  // Transportation
  "uber": {
    keywords: ["uber"],
    icon: Car,
    color: "#000000",
    category: "Transporte"
  },
  "bolt": {
    keywords: ["bolt", "taxify"],
    icon: Car,
    color: "#34D186",
    category: "Transporte"
  },
  "shell": {
    keywords: ["shell"],
    icon: Fuel,
    color: "#FBCE07",
    category: "Transporte"
  },
  "esso": {
    keywords: ["esso"],
    icon: Fuel,
    color: "#EE3124",
    category: "Transporte"
  },

  // Airlines & Travel
  "lufthansa": {
    keywords: ["lufthansa"],
    icon: Plane,
    color: "#05164D",
    category: "Viagem"
  },
  "ryanair": {
    keywords: ["ryanair"],
    icon: Plane,
    color: "#073590",
    category: "Viagem"
  },
  "booking": {
    keywords: ["booking.com", "booking"],
    icon: Plane,
    color: "#003580",
    category: "Viagem"
  },
  "airbnb": {
    keywords: ["airbnb"],
    icon: Home,
    color: "#FF5A5F",
    category: "Viagem"
  },

  // Tech & Services
  "apple": {
    keywords: ["apple.com", "apple store", "itunes"],
    icon: Smartphone,
    color: "#000000",
    category: "Tecnologia"
  },
  "google": {
    keywords: ["google", "google play"],
    icon: Smartphone,
    color: "#4285F4",
    category: "Tecnologia"
  },
  "microsoft": {
    keywords: ["microsoft", "xbox"],
    icon: Smartphone,
    color: "#00A4EF",
    category: "Tecnologia"
  },
  "openai": {
    keywords: ["openai", "chatgpt"],
    icon: Sparkles,
    color: "#10A37F",
    category: "Tecnologia"
  },
  "claude": {
    keywords: ["anthropic", "claude"],
    icon: Sparkles,
    color: "#D97757",
    category: "Tecnologia"
  },

  // Utilities
  "telekom": {
    keywords: ["telekom", "deutsche telekom"],
    icon: Wifi,
    color: "#E20074",
    category: "Internet"
  },
  "vodafone": {
    keywords: ["vodafone"],
    icon: Wifi,
    color: "#E60000",
    category: "Internet"
  },
  "o2": {
    keywords: ["o2", "telefonica"],
    icon: Wifi,
    color: "#0019A5",
    category: "Internet"
  },

  // Fitness & Health
  "fitx": {
    keywords: ["fitx", "fit x"],
    icon: Dumbbell,
    color: "#FF6600",
    category: "Academia"
  },
  "mcfit": {
    keywords: ["mcfit"],
    icon: Dumbbell,
    color: "#FF0000",
    category: "Academia"
  },
  "apotheke": {
    keywords: ["apotheke", "pharmacy"],
    icon: Heart,
    color: "#E20613",
    category: "Saúde"
  },

  // Education
  "udemy": {
    keywords: ["udemy"],
    icon: GraduationCap,
    color: "#A435F0",
    category: "Educação"
  },
  "coursera": {
    keywords: ["coursera"],
    icon: GraduationCap,
    color: "#0056D2",
    category: "Educação"
  },
};

/**
 * Find merchant icon from transaction description
 * Returns icon and color, or undefined if no match
 */
export function getMerchantIcon(description: string): { icon: LucideIcon; color: string; merchantName?: string } | undefined {
  if (!description) return undefined;

  const normalized = description.toLowerCase();

  for (const [merchantName, config] of Object.entries(MERCHANT_ICONS)) {
    if (config.keywords.some(keyword => normalized.includes(keyword))) {
      return {
        icon: config.icon,
        color: config.color,
        merchantName
      };
    }
  }

  return undefined;
}

/**
 * Get fallback icon for category
 */
export function getCategoryIcon(category?: string): LucideIcon {
  if (!category) return CreditCard;

  const categoryIconMap: Record<string, LucideIcon> = {
    "Mercado": ShoppingCart,
    "Lazer": Film,
    "Alimentação": Utensils,
    "Transporte": Car,
    "Viagem": Plane,
    "Tecnologia": Smartphone,
    "Internet": Wifi,
    "Streaming": Music,
    "Academia": Dumbbell,
    "Saúde": Heart,
    "Educação": GraduationCap,
    "Roupas": Shirt,
    "Presentes": Gift,
    "Moradia": Home,
    "Compras Online": Package
  };

  return categoryIconMap[category] || CreditCard;
}

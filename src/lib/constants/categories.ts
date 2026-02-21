/**
 * Category definitions with colors, icons, and display names
 * Based on reference design images and app taxonomy
 */

import {
  Utensils,
  ShoppingCart,
  Briefcase,
  CircleDashed,
  Dumbbell,
  ShoppingBag,
  Home,
  Car,
  Landmark,
  HeartPulse,
  GraduationCap,
  Layers,
  type LucideIcon
} from "lucide-react";

export interface CategoryConfig {
  name: string;
  displayName: string;
  icon: string; 
  lucideIcon: LucideIcon;
  color: string; // Canonical hex accent
  slug: string; // For CSS data-attributes if needed
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'Alimentação': {
    name: 'Alimentação',
    displayName: 'Alimentação',
    icon: '🍽️',
    lucideIcon: Utensils,
    color: '#F97316', // Orange-500 (Appetite/Energy)
    slug: 'food',
  },
  'Mercados': {
    name: 'Mercados',
    displayName: 'Mercados',
    icon: '🛒',
    lucideIcon: ShoppingCart, // Changed: Distinct from ShoppingBag
    color: '#059669', // Emerald-600 (Freshness)
    slug: 'market',
  },
  'Moradia': {
    name: 'Moradia',
    displayName: 'Moradia',
    icon: '🏠',
    lucideIcon: Home,
    color: '#0891B2', // Cyan-600 (Stability)
    slug: 'housing',
  },
  'Transporte': {
    name: 'Transporte',
    displayName: 'Transporte',
    icon: '🚗',
    lucideIcon: Car,
    color: '#475569', // Slate-600 (Neutral/Utility)
    slug: 'transport',
  },
  'Lazer': {
    name: 'Lazer',
    displayName: 'Lazer',
    icon: '🎬',
    lucideIcon: Dumbbell,
    color: '#9333EA', // Purple-600 (Vigor/Entertainment)
    slug: 'leisure',
  },
  'Compras': {
    name: 'Compras',
    displayName: 'Compras',
    icon: '🛍️',
    lucideIcon: ShoppingBag,
    color: '#DB2777', // Pink-600 (Expression)
    slug: 'shopping',
  },
  'Saúde': {
    name: 'Saúde',
    displayName: 'Saúde',
    icon: '❤️',
    lucideIcon: HeartPulse, // Changed: More medical/specific
    color: '#DC2626', // Red-600 (Vitality)
    slug: 'health',
  },
  'Trabalho': {
    name: 'Trabalho',
    displayName: 'Trabalho',
    icon: '💼',
    lucideIcon: Briefcase,
    color: '#0D9488', // Teal-600 (Professional)
    slug: 'work',
  },
  'Educação': {
    name: 'Educação',
    displayName: 'Educação',
    icon: '📚',
    lucideIcon: GraduationCap,
    color: '#4F46E5', // Indigo-600 (Knowledge)
    slug: 'education',
  },
  'Finanças': {
    name: 'Finanças',
    displayName: 'Finanças',
    icon: '🏦',
    lucideIcon: Landmark, // Changed: More stable/banking icon
    color: '#D97706', // Amber-600 (Wealth)
    slug: 'finance',
  },
  'Outros': {
    name: 'Outros',
    displayName: 'Outros',
    icon: '📦',
    lucideIcon: Layers, // Changed: To signify miscellaneous layers
    color: '#78350F', // Brown-900 (Grounded/Miscellaneous)
    slug: 'others',
  },
  'OPEN': {
    name: 'OPEN',
    displayName: 'OPEN',
    icon: '❓',
    lucideIcon: CircleDashed, // Changed: To signify 'incomplete' or 'in-process'
    color: '#94A3B8', // Gray-400 (Ghost/Inactive state)
    slug: 'open',
  },
};

export function getCategoryConfig(categoryName: string | null): CategoryConfig {
  if (!categoryName || categoryName === 'OPEN') {
    return CATEGORY_CONFIGS['OPEN'];
  }
  // Try direct match first
  if (CATEGORY_CONFIGS[categoryName]) {
    return CATEGORY_CONFIGS[categoryName];
  }
  // Try case-insensitive match
  const normalized = categoryName.toLowerCase();
  for (const [key, config] of Object.entries(CATEGORY_CONFIGS)) {
    if (key.toLowerCase() === normalized) {
      return config;
    }
  }
  return CATEGORY_CONFIGS['Outros'];
}

export const CATEGORY_LIST = Object.values(CATEGORY_CONFIGS);

// Transaction type colors
export const TYPE_STYLES = {
  "Despesa": {
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    darkBgColor: "dark:bg-red-900/20",
    darkColor: "dark:text-red-400"
  },
  "Receita": {
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    darkBgColor: "dark:bg-green-900/20",
    darkColor: "dark:text-green-400"
  }
};

// FixVar colors
export const FIXVAR_STYLES = {
  "Fixo": {
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    darkBgColor: "dark:bg-blue-900/20",
    darkColor: "dark:text-blue-400"
  },
  "Variável": {
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    darkBgColor: "dark:bg-amber-900/20",
    darkColor: "dark:text-amber-400"
  }
};

// Priority explanation for tooltips
export const PRIORITY_INFO = {
  title: "Prioridade",
  description: "Determina a ordem de aplicação das regras. Valores maiores são aplicados primeiro. Regras do sistema têm prioridade 950+.",
  range: "0-1000"
};

// Mode (strict) explanation for tooltips
export const MODE_INFO = {
  strict: {
    title: "Estrito",
    description: "Aplica automaticamente sem revisão. Confiança 100%."
  },
  flexible: {
    title: "Flexível",
    description: "Requer confirmação manual. Permite revisão antes de aplicar."
  }
};

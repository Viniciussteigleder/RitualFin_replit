/**
 * Category definitions with colors, icons, and display names
 * Based on reference design images and app taxonomy
 */

import {
  Utensils,
  ShoppingCart,
  Briefcase,
  HelpCircle,
  Dumbbell,
  ShoppingBag,
  Home,
  ArrowLeftRight,
  Car,
  Building2,
  Heart,
  Wallet,
  Plane,
  GraduationCap,
  Baby,
  PiggyBank,
  CreditCard,
  Receipt,
  Gift,
  Coffee,
  Wifi,
  Smartphone,
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
    color: '#F59E0B', // Amber/Food
    slug: 'food',
  },
  'Mercados': {
    name: 'Mercados',
    displayName: 'Mercados',
    icon: '🛒',
    lucideIcon: ShoppingBag,
    color: '#10B981', // Emerald/Market
    slug: 'market',
  },
  'Moradia': {
    name: 'Moradia',
    displayName: 'Moradia',
    icon: '🏠',
    lucideIcon: Home,
    color: '#3B82F6', // Blue/Housing
    slug: 'housing',
  },
  'Transporte': {
    name: 'Transporte',
    displayName: 'Transporte',
    icon: '🚗',
    lucideIcon: Car,
    color: '#6366F1', // Indigo/Transport
    slug: 'transport',
  },
  'Lazer': {
    name: 'Lazer',
    displayName: 'Lazer',
    icon: '🎬',
    lucideIcon: Dumbbell,
    color: '#8B5CF6', // Violet/Leisure
    slug: 'leisure',
  },
  'Compras': {
    name: 'Compras',
    displayName: 'Compras',
    icon: '🛍️',
    lucideIcon: ShoppingBag,
    color: '#EC4899', // Pink/Shopping
    slug: 'shopping',
  },
  'Saúde': {
    name: 'Saúde',
    displayName: 'Saúde',
    icon: '❤️',
    lucideIcon: Heart,
    color: '#F43F5E', // Rose/Health
    slug: 'health',
  },
  'Trabalho': {
    name: 'Trabalho',
    displayName: 'Trabalho',
    icon: '💼',
    lucideIcon: Briefcase,
    color: '#14B8A6', // Teal/Work
    slug: 'work',
  },
  'Educação': {
    name: 'Educação',
    displayName: 'Educação',
    icon: '📚',
    lucideIcon: GraduationCap,
    color: '#EAB308', // Yellow/Education
    slug: 'education',
  },
  'Finanças': {
    name: 'Finanças',
    displayName: 'Finanças',
    icon: '🏦',
    lucideIcon: Building2,
    color: '#F59E0B',
    slug: 'finance',
  },
  'Outros': {
    name: 'Outros',
    displayName: 'Outros',
    icon: '📦',
    lucideIcon: HelpCircle,
    color: '#94A3B8',
    slug: 'others',
  },
};

export function getCategoryConfig(categoryName: string | null): CategoryConfig {
  if (!categoryName) {
    return CATEGORY_CONFIGS['Outros'];
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

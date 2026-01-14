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
  icon: string; // Emoji fallback
  lucideIcon: LucideIcon;
  bgColor: string;
  textColor: string;
  progressColor: string;
  borderColor: string;
  color: string; // Hex color for charts
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'Alimentação': {
    name: 'Alimentação',
    displayName: 'Alimentação',
    icon: '🍽️',
    lucideIcon: Utensils,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    progressColor: 'bg-orange-500',
    borderColor: 'border-orange-200',
    color: '#F59E0B',
  },
  'Mercados': {
    name: 'Mercados',
    displayName: 'Mercados',
    icon: '🛒',
    lucideIcon: ShoppingBag,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    progressColor: 'bg-emerald-500',
    borderColor: 'border-emerald-200',
    color: '#10B981',
  },
  'Moradia': {
    name: 'Moradia',
    displayName: 'Moradia',
    icon: '🏠',
    lucideIcon: Home,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    color: '#3B82F6',
  },
  'Transporte': {
    name: 'Transporte',
    displayName: 'Transporte',
    icon: '🚗',
    lucideIcon: Car,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    progressColor: 'bg-slate-500',
    borderColor: 'border-slate-200',
    color: '#64748B',
  },
  'Esportes': {
    name: 'Esportes',
    displayName: 'Esportes',
    icon: '🏃',
    lucideIcon: Dumbbell,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    color: '#F97316',
  },
  'Lazer': {
    name: 'Lazer',
    displayName: 'Lazer',
    icon: '🎬',
    lucideIcon: ShoppingBag,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    progressColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    color: '#A855F7',
  },
  'Compras': {
    name: 'Compras',
    displayName: 'Compras',
    icon: '🛍️',
    lucideIcon: ShoppingBag,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    progressColor: 'bg-pink-500',
    borderColor: 'border-pink-200',
    color: '#EC4899',
  },
  'Saúde': {
    name: 'Saúde',
    displayName: 'Saúde',
    icon: '❤️',
    lucideIcon: Heart,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    progressColor: 'bg-red-500',
    borderColor: 'border-red-200',
    color: '#EF4444',
  },
  'Trabalho': {
    name: 'Trabalho',
    displayName: 'Trabalho',
    icon: '💼',
    lucideIcon: Briefcase,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    progressColor: 'bg-indigo-500',
    borderColor: 'border-indigo-200',
    color: '#6366F1',
  },
  'Renda Extra': {
    name: 'Renda Extra',
    displayName: 'Renda Extra',
    icon: '💰',
    lucideIcon: Wallet,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    progressColor: 'bg-green-500',
    borderColor: 'border-green-200',
    color: '#22C55E',
  },
  'Finanças': {
    name: 'Finanças',
    displayName: 'Finanças',
    icon: '🏦',
    lucideIcon: Building2,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    color: '#D97706',
  },
  'Mobilidade': {
    name: 'Mobilidade',
    displayName: 'Mobilidade',
    icon: '🚲',
    lucideIcon: Car,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    progressColor: 'bg-cyan-500',
    borderColor: 'border-cyan-200',
    color: '#06B6D4',
  },
  'Doações': {
    name: 'Doações',
    displayName: 'Doações',
    icon: '🎁',
    lucideIcon: Heart,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    progressColor: 'bg-rose-500',
    borderColor: 'border-rose-200',
    color: '#E11D48',
  },
  'Outros': {
    name: 'Outros',
    displayName: 'Outros',
    icon: '📦',
    lucideIcon: HelpCircle,
    bgColor: 'bg-neutral-50',
    textColor: 'text-neutral-600',
    progressColor: 'bg-neutral-400',
    borderColor: 'border-neutral-200',
    color: '#71717A',
  },
  'OPEN': {
    name: 'OPEN',
    displayName: 'Não Classificado',
    icon: '❓',
    lucideIcon: HelpCircle,
    bgColor: 'bg-zinc-100',
    textColor: 'text-zinc-600',
    progressColor: 'bg-zinc-500',
    borderColor: 'border-zinc-200',
    color: '#3F3F46',
  },
  'Assinaturas': {
    name: 'Assinaturas',
    displayName: 'Assinaturas',
    icon: '💳',
    lucideIcon: CreditCard,
    bgColor: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-600',
    progressColor: 'bg-fuchsia-500',
    borderColor: 'border-fuchsia-200',
    color: '#D946EF',
  },
  'Educação': {
    name: 'Educação',
    displayName: 'Educação',
    icon: '📚',
    lucideIcon: GraduationCap,
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    progressColor: 'bg-violet-500',
    borderColor: 'border-violet-200',
    color: '#8B5CF6',
  },
  'Telefone': {
    name: 'Telefone',
    displayName: 'Telefone',
    icon: '📱',
    lucideIcon: Smartphone,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    progressColor: 'bg-teal-500',
    borderColor: 'border-teal-200',
    color: '#14B8A6',
  },
  'Internet': {
    name: 'Internet',
    displayName: 'Internet',
    icon: '📡',
    lucideIcon: Wifi,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    progressColor: 'bg-sky-500',
    borderColor: 'border-sky-200',
    color: '#0EA5E9',
  },
  'Saúde & Seguros': {
    name: 'Saúde & Seguros',
    displayName: 'Saúde & Seguros',
    icon: '🛡️',
    lucideIcon: Heart,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    progressColor: 'bg-red-500',
    borderColor: 'border-red-200',
    color: '#EF4444',
  },
  'Educação & Crianças': {
    name: 'Educação & Crianças',
    displayName: 'Educação & Crianças',
    icon: '👶',
    lucideIcon: Baby,
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    progressColor: 'bg-violet-500',
    borderColor: 'border-violet-200',
    color: '#8B5CF6',
  },
  'Lazer & Viagens': {
    name: 'Lazer & Viagens',
    displayName: 'Lazer & Viagens',
    icon: '✈️',
    lucideIcon: Plane,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    progressColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    color: '#A855F7',
  },
  'Compras & Estilo de Vida': {
    name: 'Compras & Estilo de Vida',
    displayName: 'Compras & Estilo de Vida',
    icon: '✨',
    lucideIcon: ShoppingBag,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    progressColor: 'bg-pink-500',
    borderColor: 'border-pink-200',
    color: '#EC4899',
  },
  'Finanças & Transferências': {
    name: 'Finanças & Transferências',
    displayName: 'Finanças & Transferências',
    icon: '🔄',
    lucideIcon: ArrowLeftRight,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    progressColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    color: '#F59E0B',
  },
  'Trabalho & Receitas': {
    name: 'Trabalho & Receitas',
    displayName: 'Trabalho & Receitas',
    icon: '📈',
    lucideIcon: Briefcase,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    progressColor: 'bg-indigo-500',
    borderColor: 'border-indigo-200',
    color: '#6366F1',
  },
  'Doações & Outros': {
    name: 'Doações & Outros',
    displayName: 'Doações & Outros',
    icon: '🤝',
    lucideIcon: Gift,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    progressColor: 'bg-rose-500',
    borderColor: 'border-rose-200',
    color: '#F43F5E',
  },
  'Revisão & Não Classificado': {
    name: 'Revisão & Não Classificado',
    displayName: 'Em Revisão',
    icon: '🧠',
    lucideIcon: HelpCircle,
    bgColor: 'bg-zinc-50',
    textColor: 'text-zinc-700',
    progressColor: 'bg-zinc-500',
    borderColor: 'border-zinc-200',
    color: '#71717A',
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
